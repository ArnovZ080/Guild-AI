"""
Selenium Automation Module for Guild-AI

This module provides web automation capabilities using Selenium WebDriver
to complement the existing visual automation system.
"""

import logging
import time
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import tempfile
import json

# Conditional imports for Selenium
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    print("Warning: Selenium not available. Install with: pip install selenium")

logger = logging.getLogger(__name__)

class SeleniumAutomation:
    """
    Web automation using Selenium WebDriver.
    """
    
    def __init__(self, browser: str = "chrome", headless: bool = True):
        """
        Initialize Selenium automation.
        
        Args:
            browser: Browser to use (chrome, firefox)
            headless: Whether to run in headless mode
        """
        if not SELENIUM_AVAILABLE:
            raise ImportError("Selenium is required for web automation. Install with: pip install selenium")
        
        self.browser = browser
        self.headless = headless
        self.driver = None
        self.wait = None
        
        logger.info(f"Selenium automation initialized with {browser} browser (headless: {headless})")
    
    def _setup_driver(self):
        """Setup the WebDriver."""
        if self.driver is not None:
            return
        
        try:
            if self.browser.lower() == "chrome":
                options = ChromeOptions()
                if self.headless:
                    options.add_argument("--headless")
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                options.add_argument("--disable-gpu")
                options.add_argument("--window-size=1920,1080")
                
                self.driver = webdriver.Chrome(options=options)
                
            elif self.browser.lower() == "firefox":
                options = FirefoxOptions()
                if self.headless:
                    options.add_argument("--headless")
                
                self.driver = webdriver.Firefox(options=options)
                
            else:
                raise ValueError(f"Unsupported browser: {self.browser}")
            
            # Set up wait
            self.wait = WebDriverWait(self.driver, 10)
            
            logger.info(f"WebDriver setup completed for {self.browser}")
            
        except Exception as e:
            logger.error(f"Error setting up WebDriver: {e}")
            raise
    
    def navigate_to(self, url: str) -> Dict[str, Any]:
        """
        Navigate to a URL.
        
        Args:
            url: URL to navigate to
            
        Returns:
            Navigation result
        """
        try:
            self._setup_driver()
            
            logger.info(f"Navigating to: {url}")
            self.driver.get(url)
            
            # Wait for page to load
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            return {
                'status': 'success',
                'url': url,
                'title': self.driver.title,
                'current_url': self.driver.current_url
            }
            
        except Exception as e:
            logger.error(f"Error navigating to {url}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'url': url
            }
    
    def find_element(self, 
                    locator: str, 
                    by: str = "css_selector",
                    timeout: int = 10) -> Dict[str, Any]:
        """
        Find an element on the page.
        
        Args:
            locator: Element locator
            by: Locator type (css_selector, xpath, id, class_name, tag_name)
            timeout: Timeout in seconds
            
        Returns:
            Element information
        """
        try:
            self._setup_driver()
            
            # Map string to By constant
            by_mapping = {
                'css_selector': By.CSS_SELECTOR,
                'xpath': By.XPATH,
                'id': By.ID,
                'class_name': By.CLASS_NAME,
                'tag_name': By.TAG_NAME,
                'name': By.NAME
            }
            
            by_type = by_mapping.get(by.lower(), By.CSS_SELECTOR)
            
            # Wait for element
            wait = WebDriverWait(self.driver, timeout)
            element = wait.until(EC.presence_of_element_located((by_type, locator)))
            
            return {
                'status': 'success',
                'element_found': True,
                'tag_name': element.tag_name,
                'text': element.text,
                'is_displayed': element.is_displayed(),
                'is_enabled': element.is_enabled(),
                'location': element.location,
                'size': element.size
            }
            
        except TimeoutException:
            logger.warning(f"Element not found: {locator}")
            return {
                'status': 'error',
                'error': 'Element not found',
                'element_found': False,
                'locator': locator
            }
        except Exception as e:
            logger.error(f"Error finding element {locator}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'locator': locator
            }
    
    def click_element(self, 
                     locator: str, 
                     by: str = "css_selector",
                     timeout: int = 10) -> Dict[str, Any]:
        """
        Click an element.
        
        Args:
            locator: Element locator
            by: Locator type
            timeout: Timeout in seconds
            
        Returns:
            Click result
        """
        try:
            self._setup_driver()
            
            # Find element
            element_result = self.find_element(locator, by, timeout)
            if element_result['status'] != 'success':
                return element_result
            
            # Get element and click
            by_mapping = {
                'css_selector': By.CSS_SELECTOR,
                'xpath': By.XPATH,
                'id': By.ID,
                'class_name': By.CLASS_NAME,
                'tag_name': By.TAG_NAME,
                'name': By.NAME
            }
            
            by_type = by_mapping.get(by.lower(), By.CSS_SELECTOR)
            element = self.driver.find_element(by_type, locator)
            
            # Scroll to element if needed
            self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
            time.sleep(0.5)
            
            # Click element
            element.click()
            
            logger.info(f"Clicked element: {locator}")
            
            return {
                'status': 'success',
                'action': 'click',
                'locator': locator,
                'clicked': True
            }
            
        except Exception as e:
            logger.error(f"Error clicking element {locator}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'locator': locator,
                'clicked': False
            }
    
    def type_text(self, 
                 locator: str, 
                 text: str,
                 by: str = "css_selector",
                 clear_first: bool = True,
                 timeout: int = 10) -> Dict[str, Any]:
        """
        Type text into an input field.
        
        Args:
            locator: Element locator
            text: Text to type
            by: Locator type
            clear_first: Whether to clear the field first
            timeout: Timeout in seconds
            
        Returns:
            Type result
        """
        try:
            self._setup_driver()
            
            # Find element
            element_result = self.find_element(locator, by, timeout)
            if element_result['status'] != 'success':
                return element_result
            
            # Get element
            by_mapping = {
                'css_selector': By.CSS_SELECTOR,
                'xpath': By.XPATH,
                'id': By.ID,
                'class_name': By.CLASS_NAME,
                'tag_name': By.TAG_NAME,
                'name': By.NAME
            }
            
            by_type = by_mapping.get(by.lower(), By.CSS_SELECTOR)
            element = self.driver.find_element(by_type, locator)
            
            # Clear field if requested
            if clear_first:
                element.clear()
            
            # Type text
            element.send_keys(text)
            
            logger.info(f"Typed text into element: {locator}")
            
            return {
                'status': 'success',
                'action': 'type',
                'locator': locator,
                'text': text,
                'typed': True
            }
            
        except Exception as e:
            logger.error(f"Error typing text into element {locator}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'locator': locator,
                'typed': False
            }
    
    def extract_data(self, 
                    selectors: Dict[str, str],
                    wait_for_element: Optional[str] = None) -> Dict[str, Any]:
        """
        Extract data from the current page.
        
        Args:
            selectors: Dictionary of field names to CSS selectors
            wait_for_element: Optional element to wait for before extraction
            
        Returns:
            Extracted data
        """
        try:
            self._setup_driver()
            
            # Wait for specific element if provided
            if wait_for_element:
                self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, wait_for_element)))
            
            extracted_data = {}
            
            for field_name, selector in selectors.items():
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    
                    if elements:
                        if len(elements) == 1:
                            # Single element
                            element = elements[0]
                            if element.tag_name in ['input', 'textarea']:
                                extracted_data[field_name] = element.get_attribute('value')
                            else:
                                extracted_data[field_name] = element.text
                        else:
                            # Multiple elements
                            extracted_data[field_name] = [elem.text for elem in elements]
                    else:
                        extracted_data[field_name] = None
                        
                except Exception as e:
                    logger.warning(f"Error extracting {field_name}: {e}")
                    extracted_data[field_name] = None
            
            logger.info(f"Extracted data for {len(extracted_data)} fields")
            
            return {
                'status': 'success',
                'data': extracted_data,
                'fields_extracted': len([v for v in extracted_data.values() if v is not None])
            }
            
        except Exception as e:
            logger.error(f"Error extracting data: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'data': {}
            }
    
    def fill_form(self, 
                 form_data: Dict[str, str],
                 submit_button: Optional[str] = None) -> Dict[str, Any]:
        """
        Fill a form with data.
        
        Args:
            form_data: Dictionary of field names to values
            submit_button: Optional submit button selector
            
        Returns:
            Form filling result
        """
        try:
            self._setup_driver()
            
            filled_fields = []
            failed_fields = []
            
            for field_name, value in form_data.items():
                try:
                    # Try different selector strategies
                    selectors = [
                        f"input[name='{field_name}']",
                        f"input[id='{field_name}']",
                        f"textarea[name='{field_name}']",
                        f"select[name='{field_name}']",
                        f"#{field_name}",
                        f".{field_name}"
                    ]
                    
                    element_found = False
                    for selector in selectors:
                        try:
                            element = self.driver.find_element(By.CSS_SELECTOR, selector)
                            element.clear()
                            element.send_keys(value)
                            filled_fields.append(field_name)
                            element_found = True
                            break
                        except NoSuchElementException:
                            continue
                    
                    if not element_found:
                        failed_fields.append(field_name)
                        
                except Exception as e:
                    logger.warning(f"Error filling field {field_name}: {e}")
                    failed_fields.append(field_name)
            
            # Submit form if submit button provided
            submitted = False
            if submit_button:
                try:
                    submit_result = self.click_element(submit_button)
                    submitted = submit_result['status'] == 'success'
                except Exception as e:
                    logger.warning(f"Error submitting form: {e}")
            
            return {
                'status': 'success',
                'filled_fields': filled_fields,
                'failed_fields': failed_fields,
                'submitted': submitted,
                'total_fields': len(form_data)
            }
            
        except Exception as e:
            logger.error(f"Error filling form: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'filled_fields': [],
                'failed_fields': list(form_data.keys())
            }
    
    def take_screenshot(self, 
                       filename: Optional[str] = None,
                       full_page: bool = False) -> Dict[str, Any]:
        """
        Take a screenshot of the current page.
        
        Args:
            filename: Optional filename for screenshot
            full_page: Whether to capture full page
            
        Returns:
            Screenshot result
        """
        try:
            self._setup_driver()
            
            # Create filename if not provided
            if not filename:
                temp_dir = tempfile.mkdtemp(prefix="guild_screenshot_")
                filename = Path(temp_dir) / "screenshot.png"
            else:
                filename = Path(filename)
            
            # Take screenshot
            if full_page:
                # Full page screenshot
                self.driver.execute_script("window.scrollTo(0, 0);")
                total_height = self.driver.execute_script("return document.body.scrollHeight")
                self.driver.set_window_size(1920, total_height)
                time.sleep(1)
            
            self.driver.save_screenshot(str(filename))
            
            logger.info(f"Screenshot saved: {filename}")
            
            return {
                'status': 'success',
                'screenshot_path': str(filename),
                'full_page': full_page
            }
            
        except Exception as e:
            logger.error(f"Error taking screenshot: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def execute_javascript(self, script: str) -> Dict[str, Any]:
        """
        Execute JavaScript on the page.
        
        Args:
            script: JavaScript code to execute
            
        Returns:
            Execution result
        """
        try:
            self._setup_driver()
            
            result = self.driver.execute_script(script)
            
            logger.info("JavaScript executed successfully")
            
            return {
                'status': 'success',
                'result': result,
                'script': script
            }
            
        except Exception as e:
            logger.error(f"Error executing JavaScript: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'script': script
            }
    
    def wait_for_element(self, 
                        locator: str, 
                        by: str = "css_selector",
                        timeout: int = 10,
                        condition: str = "presence") -> Dict[str, Any]:
        """
        Wait for an element to meet a condition.
        
        Args:
            locator: Element locator
            by: Locator type
            timeout: Timeout in seconds
            condition: Condition to wait for (presence, clickable, visible)
            
        Returns:
            Wait result
        """
        try:
            self._setup_driver()
            
            by_mapping = {
                'css_selector': By.CSS_SELECTOR,
                'xpath': By.XPATH,
                'id': By.ID,
                'class_name': By.CLASS_NAME,
                'tag_name': By.TAG_NAME,
                'name': By.NAME
            }
            
            by_type = by_mapping.get(by.lower(), By.CSS_SELECTOR)
            
            # Map condition to expected condition
            condition_mapping = {
                'presence': EC.presence_of_element_located,
                'clickable': EC.element_to_be_clickable,
                'visible': EC.visibility_of_element_located
            }
            
            expected_condition = condition_mapping.get(condition, EC.presence_of_element_located)
            
            # Wait for condition
            wait = WebDriverWait(self.driver, timeout)
            element = wait.until(expected_condition((by_type, locator)))
            
            return {
                'status': 'success',
                'element_found': True,
                'condition': condition,
                'timeout': timeout
            }
            
        except TimeoutException:
            logger.warning(f"Element not found within {timeout}s: {locator}")
            return {
                'status': 'error',
                'error': 'Timeout waiting for element',
                'element_found': False,
                'condition': condition,
                'timeout': timeout
            }
        except Exception as e:
            logger.error(f"Error waiting for element {locator}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'locator': locator
            }
    
    def close(self):
        """Close the browser and cleanup."""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("Browser closed successfully")
            except Exception as e:
                logger.warning(f"Error closing browser: {e}")
            finally:
                self.driver = None
                self.wait = None
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()

# Convenience function
def get_selenium_automation(browser: str = "chrome", headless: bool = True) -> SeleniumAutomation:
    """Get an instance of Selenium automation."""
    return SeleniumAutomation(browser=browser, headless=headless)
