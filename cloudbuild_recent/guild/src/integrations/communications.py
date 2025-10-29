"""
Communication Platform Integrations

Comprehensive integration with Slack, Microsoft Teams, and Discord APIs
for Multi-Channel Inbox and Community Connector Agents.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class CommunicationPlatform(Enum):
    SLACK = "slack"
    MICROSOFT_TEAMS = "microsoft_teams"
    DISCORD = "discord"

class MessageType(Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    LINK = "link"
    CODE = "code"
    QUOTE = "quote"
    THREAD = "thread"

class ChannelType(Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    DIRECT_MESSAGE = "direct_message"
    GROUP = "group"
    VOICE = "voice"

@dataclass
class CommunicationCredentials:
    """Credentials for communication platforms"""
    platform: CommunicationPlatform
    bot_token: str
    app_token: Optional[str] = None  # For Slack
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    tenant_id: Optional[str] = None  # For Microsoft Teams
    expires_at: Optional[datetime] = None

@dataclass
class Message:
    """Standardized message format"""
    id: str
    channel_id: str
    user_id: str
    username: str
    content: str
    message_type: MessageType
    timestamp: datetime
    thread_ts: Optional[str] = None
    parent_message_id: Optional[str] = None
    reactions: List[Dict[str, Any]] = None
    attachments: List[Dict[str, Any]] = None
    mentions: List[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.reactions is None:
            self.reactions = []
        if self.attachments is None:
            self.attachments = []
        if self.mentions is None:
            self.mentions = []
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Channel:
    """Standardized channel format"""
    id: str
    name: str
    channel_type: ChannelType
    description: str
    member_count: int
    is_archived: bool
    created_at: datetime
    topic: Optional[str] = None
    purpose: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class User:
    """Standardized user format"""
    id: str
    username: str
    display_name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    is_bot: bool = False
    is_admin: bool = False
    status: str = "active"
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class SlackConnector:
    """Slack API connector"""
    
    def __init__(self, credentials: CommunicationCredentials):
        self.credentials = credentials
        self.base_url = "https://slack.com/api"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Slack API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.bot_token}',
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                result = await response.json()
                
                if not result.get('ok'):
                    raise Exception(f"Slack API error: {result.get('error', 'Unknown error')}")
                
                return result
                
        except Exception as e:
            logger.error(f"Slack API request failed: {e}")
            raise
    
    async def get_channels(self, types: str = "public_channel,private_channel") -> List[Channel]:
        """Get all channels"""
        endpoint = "/conversations.list"
        params = {
            'types': types,
            'limit': 1000
        }
        
        response = await self._make_request(endpoint, params=params)
        
        channels = []
        for channel_data in response.get('channels', []):
            channel = Channel(
                id=channel_data['id'],
                name=channel_data['name'],
                channel_type=ChannelType.PUBLIC if channel_data.get('is_private') == False else ChannelType.PRIVATE,
                description=channel_data.get('topic', {}).get('value', ''),
                member_count=channel_data.get('num_members', 0),
                is_archived=channel_data.get('is_archived', False),
                created_at=datetime.fromtimestamp(channel_data.get('created', 0)),
                topic=channel_data.get('topic', {}).get('value'),
                purpose=channel_data.get('purpose', {}).get('value'),
                metadata={"raw_data": channel_data}
            )
            channels.append(channel)
        
        return channels
    
    async def get_messages(self, channel_id: str, count: int = 100) -> List[Message]:
        """Get messages from a channel"""
        endpoint = "/conversations.history"
        params = {
            'channel': channel_id,
            'limit': count
        }
        
        response = await self._make_request(endpoint, params=params)
        
        messages = []
        for message_data in response.get('messages', []):
            message = Message(
                id=message_data['ts'],
                channel_id=channel_id,
                user_id=message_data.get('user', ''),
                username=message_data.get('username', ''),
                content=message_data.get('text', ''),
                message_type=self._parse_message_type(message_data),
                timestamp=datetime.fromtimestamp(float(message_data['ts'])),
                thread_ts=message_data.get('thread_ts'),
                parent_message_id=message_data.get('parent_user_id'),
                reactions=self._parse_reactions(message_data.get('reactions', [])),
                attachments=message_data.get('attachments', []),
                mentions=self._parse_mentions(message_data.get('text', '')),
                metadata={"raw_data": message_data}
            )
            messages.append(message)
        
        return messages
    
    async def send_message(self, 
                          channel_id: str,
                          text: str,
                          thread_ts: str = None,
                          blocks: List[Dict[str, Any]] = None) -> Message:
        """Send a message to a channel"""
        endpoint = "/chat.postMessage"
        
        data = {
            'channel': channel_id,
            'text': text
        }
        
        if thread_ts:
            data['thread_ts'] = thread_ts
        
        if blocks:
            data['blocks'] = blocks
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        message_data = response.get('message', {})
        message = Message(
            id=message_data.get('ts', ''),
            channel_id=channel_id,
            user_id=message_data.get('user', ''),
            username=message_data.get('username', ''),
            content=text,
            message_type=MessageType.TEXT,
            timestamp=datetime.fromtimestamp(float(message_data.get('ts', 0))),
            thread_ts=thread_ts,
            metadata={"created_via_api": True, "raw_data": message_data}
        )
        
        return message
    
    async def get_users(self) -> List[User]:
        """Get all users"""
        endpoint = "/users.list"
        params = {'limit': 1000}
        
        response = await self._make_request(endpoint, params=params)
        
        users = []
        for user_data in response.get('members', []):
            profile = user_data.get('profile', {})
            user = User(
                id=user_data['id'],
                username=user_data.get('name', ''),
                display_name=profile.get('display_name', '') or profile.get('real_name', ''),
                email=profile.get('email'),
                avatar_url=profile.get('image_72'),
                is_bot=user_data.get('is_bot', False),
                is_admin=user_data.get('is_admin', False),
                status=user_data.get('deleted', False) and 'deleted' or 'active',
                metadata={"raw_data": user_data}
            )
            users.append(user)
        
        return users
    
    async def create_channel(self, name: str, is_private: bool = False) -> Channel:
        """Create a new channel"""
        endpoint = "/conversations.create"
        
        data = {
            'name': name,
            'is_private': is_private
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        channel_data = response.get('channel', {})
        
        channel = Channel(
            id=channel_data['id'],
            name=channel_data['name'],
            channel_type=ChannelType.PRIVATE if is_private else ChannelType.PUBLIC,
            description=channel_data.get('topic', {}).get('value', ''),
            member_count=channel_data.get('num_members', 0),
            is_archived=channel_data.get('is_archived', False),
            created_at=datetime.fromtimestamp(channel_data.get('created', 0)),
            metadata={"created_via_api": True, "raw_data": channel_data}
        )
        
        return channel
    
    def _parse_message_type(self, message_data: Dict[str, Any]) -> MessageType:
        """Parse message type from Slack message data"""
        if message_data.get('files'):
            return MessageType.FILE
        elif message_data.get('attachments'):
            return MessageType.LINK
        elif message_data.get('thread_ts'):
            return MessageType.THREAD
        else:
            return MessageType.TEXT
    
    def _parse_reactions(self, reactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse reactions from Slack message data"""
        return reactions
    
    def _parse_mentions(self, text: str) -> List[str]:
        """Parse user mentions from message text"""
        import re
        mentions = re.findall(r'<@(\w+)>', text)
        return mentions
    
    async def validate_connection(self) -> bool:
        """Validate Slack API connection"""
        try:
            await self._make_request("/auth.test")
            return True
        except Exception as e:
            logger.error(f"Slack connection validation failed: {e}")
            return False

class DiscordConnector:
    """Discord API connector"""
    
    def __init__(self, credentials: CommunicationCredentials):
        self.credentials = credentials
        self.base_url = "https://discord.com/api/v10"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Discord API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bot {self.credentials.bot_token}',
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Discord API request failed: {e}")
            raise
    
    async def get_guilds(self) -> List[Dict[str, Any]]:
        """Get all guilds (servers) the bot is in"""
        endpoint = "/users/@me/guilds"
        response = await self._make_request(endpoint)
        return response
    
    async def get_channels(self, guild_id: str) -> List[Channel]:
        """Get channels from a guild"""
        endpoint = f"/guilds/{guild_id}/channels"
        response = await self._make_request(endpoint)
        
        channels = []
        for channel_data in response:
            channel_type = ChannelType.PUBLIC
            if channel_data.get('type') == 2:  # Voice channel
                channel_type = ChannelType.VOICE
            elif channel_data.get('type') == 3:  # Group DM
                channel_type = ChannelType.GROUP
            elif channel_data.get('type') == 1:  # DM
                channel_type = ChannelType.DIRECT_MESSAGE
            
            channel = Channel(
                id=str(channel_data['id']),
                name=channel_data.get('name', ''),
                channel_type=channel_type,
                description=channel_data.get('topic', ''),
                member_count=0,  # Would need additional API call
                is_archived=False,
                created_at=datetime.now(),  # Discord doesn't provide creation time
                metadata={"raw_data": channel_data}
            )
            channels.append(channel)
        
        return channels
    
    async def get_messages(self, channel_id: str, count: int = 100) -> List[Message]:
        """Get messages from a channel"""
        endpoint = f"/channels/{channel_id}/messages"
        params = {'limit': count}
        
        response = await self._make_request(endpoint, params=params)
        
        messages = []
        for message_data in response:
            message = Message(
                id=str(message_data['id']),
                channel_id=channel_id,
                user_id=str(message_data.get('author', {}).get('id', '')),
                username=message_data.get('author', {}).get('username', ''),
                content=message_data.get('content', ''),
                message_type=self._parse_message_type(message_data),
                timestamp=datetime.fromisoformat(message_data['timestamp'].replace('Z', '+00:00')),
                reactions=self._parse_reactions(message_data.get('reactions', [])),
                attachments=message_data.get('attachments', []),
                mentions=self._parse_mentions(message_data.get('mentions', [])),
                metadata={"raw_data": message_data}
            )
            messages.append(message)
        
        return messages
    
    async def send_message(self, 
                          channel_id: str,
                          content: str,
                          embed: Dict[str, Any] = None) -> Message:
        """Send a message to a channel"""
        endpoint = f"/channels/{channel_id}/messages"
        
        data = {'content': content}
        if embed:
            data['embeds'] = [embed]
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        message = Message(
            id=str(response['id']),
            channel_id=channel_id,
            user_id=str(response.get('author', {}).get('id', '')),
            username=response.get('author', {}).get('username', ''),
            content=content,
            message_type=MessageType.TEXT,
            timestamp=datetime.fromisoformat(response['timestamp'].replace('Z', '+00:00')),
            metadata={"created_via_api": True, "raw_data": response}
        )
        
        return message
    
    async def get_users(self, guild_id: str) -> List[User]:
        """Get users from a guild"""
        endpoint = f"/guilds/{guild_id}/members"
        params = {'limit': 1000}
        
        response = await self._make_request(endpoint, params=params)
        
        users = []
        for member_data in response:
            user_data = member_data.get('user', {})
            user = User(
                id=str(user_data['id']),
                username=user_data.get('username', ''),
                display_name=member_data.get('nick') or user_data.get('global_name', ''),
                avatar_url=f"https://cdn.discordapp.com/avatars/{user_data['id']}/{user_data.get('avatar')}.png" if user_data.get('avatar') else None,
                is_bot=user_data.get('bot', False),
                is_admin=False,  # Would need additional permission check
                status="active",
                metadata={"raw_data": member_data}
            )
            users.append(user)
        
        return users
    
    def _parse_message_type(self, message_data: Dict[str, Any]) -> MessageType:
        """Parse message type from Discord message data"""
        if message_data.get('attachments'):
            return MessageType.FILE
        elif message_data.get('embeds'):
            return MessageType.LINK
        else:
            return MessageType.TEXT
    
    def _parse_reactions(self, reactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse reactions from Discord message data"""
        return reactions
    
    def _parse_mentions(self, mentions: List[Dict[str, Any]]) -> List[str]:
        """Parse user mentions from Discord message data"""
        return [str(mention['id']) for mention in mentions]
    
    async def validate_connection(self) -> bool:
        """Validate Discord API connection"""
        try:
            await self._make_request("/users/@me")
            return True
        except Exception as e:
            logger.error(f"Discord connection validation failed: {e}")
            return False

class MicrosoftTeamsConnector:
    """Microsoft Teams API connector"""
    
    def __init__(self, credentials: CommunicationCredentials):
        self.credentials = credentials
        self.base_url = "https://graph.microsoft.com/v1.0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Microsoft Graph API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.bot_token}',
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Microsoft Teams API request failed: {e}")
            raise
    
    async def get_teams(self) -> List[Dict[str, Any]]:
        """Get all teams"""
        endpoint = "/me/joinedTeams"
        response = await self._make_request(endpoint)
        return response.get('value', [])
    
    async def get_channels(self, team_id: str) -> List[Channel]:
        """Get channels from a team"""
        endpoint = f"/teams/{team_id}/channels"
        response = await self._make_request(endpoint)
        
        channels = []
        for channel_data in response.get('value', []):
            channel = Channel(
                id=channel_data['id'],
                name=channel_data.get('displayName', ''),
                channel_type=ChannelType.PRIVATE if channel_data.get('membershipType') == 'private' else ChannelType.PUBLIC,
                description=channel_data.get('description', ''),
                member_count=0,  # Would need additional API call
                is_archived=False,
                created_at=datetime.now(),  # Teams doesn't provide creation time in this endpoint
                metadata={"raw_data": channel_data}
            )
            channels.append(channel)
        
        return channels
    
    async def get_messages(self, team_id: str, channel_id: str, count: int = 100) -> List[Message]:
        """Get messages from a channel"""
        endpoint = f"/teams/{team_id}/channels/{channel_id}/messages"
        params = {'$top': count}
        
        response = await self._make_request(endpoint, params=params)
        
        messages = []
        for message_data in response.get('value', []):
            message = Message(
                id=message_data['id'],
                channel_id=channel_id,
                user_id=message_data.get('from', {}).get('user', {}).get('id', ''),
                username=message_data.get('from', {}).get('user', {}).get('displayName', ''),
                content=message_data.get('body', {}).get('content', ''),
                message_type=MessageType.TEXT,
                timestamp=datetime.fromisoformat(message_data['createdDateTime'].replace('Z', '+00:00')),
                metadata={"raw_data": message_data}
            )
            messages.append(message)
        
        return messages
    
    async def send_message(self, 
                          team_id: str,
                          channel_id: str,
                          content: str) -> Message:
        """Send a message to a channel"""
        endpoint = f"/teams/{team_id}/channels/{channel_id}/messages"
        
        data = {
            'body': {
                'content': content
            }
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        message = Message(
            id=response['id'],
            channel_id=channel_id,
            user_id=response.get('from', {}).get('user', {}).get('id', ''),
            username=response.get('from', {}).get('user', {}).get('displayName', ''),
            content=content,
            message_type=MessageType.TEXT,
            timestamp=datetime.fromisoformat(response['createdDateTime'].replace('Z', '+00:00')),
            metadata={"created_via_api": True, "raw_data": response}
        )
        
        return message
    
    async def validate_connection(self) -> bool:
        """Validate Microsoft Teams API connection"""
        try:
            await self._make_request("/me")
            return True
        except Exception as e:
            logger.error(f"Microsoft Teams connection validation failed: {e}")
            return False

class CommunicationManager:
    """Manager for multiple communication platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[CommunicationPlatform, Any] = {}
    
    def add_platform(self, platform: CommunicationPlatform, credentials: CommunicationCredentials):
        """Add a communication platform connector"""
        if platform == CommunicationPlatform.SLACK:
            self.connectors[platform] = SlackConnector(credentials)
        elif platform == CommunicationPlatform.DISCORD:
            self.connectors[platform] = DiscordConnector(credentials)
        elif platform == CommunicationPlatform.MICROSOFT_TEAMS:
            self.connectors[platform] = MicrosoftTeamsConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def get_unified_messages(self, 
                                 platforms: List[CommunicationPlatform],
                                 channel_configs: Dict[CommunicationPlatform, List[str]],
                                 count: int = 100) -> Dict[str, List[Message]]:
        """Get messages from multiple platforms and channels"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors and platform in channel_configs:
                platform_messages = []
                connector = self.connectors[platform]
                
                async with connector:
                    try:
                        for channel_id in channel_configs[platform]:
                            if platform == CommunicationPlatform.SLACK:
                                messages = await connector.get_messages(channel_id, count)
                            elif platform == CommunicationPlatform.DISCORD:
                                messages = await connector.get_messages(channel_id, count)
                            elif platform == CommunicationPlatform.MICROSOFT_TEAMS:
                                # Teams needs team_id, simplified for this example
                                team_id = "default_team"  # Would need to be passed in config
                                messages = await connector.get_messages(team_id, channel_id, count)
                            else:
                                messages = []
                            
                            platform_messages.extend(messages)
                        
                        results[platform.value] = platform_messages
                        
                    except Exception as e:
                        logger.error(f"Error getting messages from {platform.value}: {e}")
                        results[platform.value] = []
        
        return results
    
    async def send_cross_platform_message(self, 
                                        platforms: List[CommunicationPlatform],
                                        channel_configs: Dict[CommunicationPlatform, str],
                                        content: str,
                                        blocks: Dict[CommunicationPlatform, List[Dict[str, Any]]] = None) -> Dict[str, Message]:
        """Send message across multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors and platform in channel_configs:
                try:
                    connector = self.connectors[platform]
                    channel_id = channel_configs[platform]
                    
                    async with connector:
                        if platform == CommunicationPlatform.SLACK:
                            platform_blocks = blocks.get(platform) if blocks else None
                            message = await connector.send_message(channel_id, content, blocks=platform_blocks)
                        elif platform == CommunicationPlatform.DISCORD:
                            # Convert Slack blocks to Discord embed if needed
                            embed = self._convert_blocks_to_embed(blocks.get(platform)) if blocks else None
                            message = await connector.send_message(channel_id, content, embed=embed)
                        elif platform == CommunicationPlatform.MICROSOFT_TEAMS:
                            team_id = channel_configs[platform].split(':')[0]  # Assume format "team_id:channel_id"
                            channel_id = channel_configs[platform].split(':')[1]
                            message = await connector.send_message(team_id, channel_id, content)
                        else:
                            continue
                        
                        results[platform.value] = message
                        
                except Exception as e:
                    logger.error(f"Error sending message on {platform.value}: {e}")
        
        return results
    
    def _convert_blocks_to_embed(self, blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Convert Slack blocks to Discord embed format"""
        if not blocks:
            return None
        
        # Simplified conversion - would need more sophisticated logic for full conversion
        embed = {
            'title': 'Message',
            'description': 'Converted from Slack blocks',
            'color': 0x00ff00
        }
        
        return embed
    
    async def validate_all_connections(self) -> Dict[CommunicationPlatform, bool]:
        """Validate connections to all communication platforms"""
        results = {}
        
        for platform, connector in self.connectors.items():
            try:
                async with connector:
                    is_valid = await connector.validate_connection()
                    results[platform] = is_valid
            except Exception as e:
                logger.error(f"Error validating {platform.value} connection: {e}")
                results[platform] = False
        
        return results

# Global communication manager
communication_manager = CommunicationManager()

# Convenience functions
def add_communication_credentials(platform: str, 
                                 bot_token: str,
                                 app_token: str = None,
                                 tenant_id: str = None):
    """Add communication platform credentials"""
    credentials = CommunicationCredentials(
        platform=CommunicationPlatform(platform),
        bot_token=bot_token,
        app_token=app_token,
        tenant_id=tenant_id
    )
    communication_manager.add_platform(credentials.platform, credentials)

async def send_message(platforms: List[str], channel_configs: Dict[str, str], content: str):
    """Send message across multiple communication platforms"""
    platform_enums = [CommunicationPlatform(platform) for platform in platforms]
    channel_configs_typed = {CommunicationPlatform(platform): config for platform, config in channel_configs.items()}
    return await communication_manager.send_cross_platform_message(platform_enums, channel_configs_typed, content)

async def get_messages(platforms: List[str], channel_configs: Dict[str, List[str]], count: int = 100):
    """Get messages from multiple communication platforms"""
    platform_enums = [CommunicationPlatform(platform) for platform in platforms]
    channel_configs_typed = {CommunicationPlatform(platform): config for platform, config in channel_configs.items()}
    return await communication_manager.get_unified_messages(platform_enums, channel_configs_typed, count)
