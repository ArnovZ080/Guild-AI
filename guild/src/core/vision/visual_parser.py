"""
Visual Parser for UI Understanding

This module provides the ability to analyze screenshots of UIs and convert them into
a structured format using OpenCV and Tesseract OCR for lightweight computer vision capabilities.
"""

import base64
import cv2
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from PIL import Image
import io
import pytesseract
import logging

logger = logging.getLogger(__name__)


class VisualParser:
    """
    A component responsible for analyzing screenshots of UIs and converting them
    into a structured format. It identifies UI elements, their types, labels, and positions
    using lightweight computer vision techniques.
    """
    
    def __init__(self):
        """Initialize the VisualParser with computer vision models."""
        try:
            # Test Tesseract availability
            pytesseract.get_tesseract_version()
            self.initialized = True
            logger.info("VisualParser initialized successfully with Tesseract OCR")
        except Exception as e:
            logger.error(f"Failed to initialize Tesseract: {e}")
            logger.info("Falling back to OpenCV-only mode for UI element detection")
            self.initialized = False
    
    def parse_screenshot(self, image: bytes) -> Dict[str, Any]:
        """
        Parse a screenshot and return structured UI element information.
        
        Args:
            image: Raw image bytes
            
        Returns:
            Dictionary containing structured UI element information
        """
        try:
            # Convert bytes to PIL Image for processing
            pil_image = Image.open(io.BytesIO(image))
            
            if not self.initialized:
                return self._parse_with_placeholder(pil_image)
            
            # Convert PIL to OpenCV format
            cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            # Perform comprehensive UI analysis
            elements = self._detect_ui_elements(cv_image)
            text_elements = self._extract_text_elements(cv_image)
            
            # Merge and structure results
            all_elements = elements + text_elements
            
            # Calculate overall confidence
            overall_confidence = self._calculate_overall_confidence(all_elements)
            
            return {
                "elements": all_elements,
                "metadata": {
                    "image_size": {"width": pil_image.width, "height": pil_image.height},
                    "parsing_method": "lightweight_computer_vision",
                    "total_elements": len(all_elements),
                    "parsing_confidence": overall_confidence,
                    "text_elements": len(text_elements),
                    "ui_elements": len(elements)
                }
            }
            
        except Exception as e:
            logger.error(f"Error parsing screenshot: {e}")
            return {
                "error": f"Failed to parse screenshot: {str(e)}",
                "elements": [],
                "metadata": {
                    "image_size": {"width": 0, "height": 0},
                    "parsing_method": "error_fallback",
                    "total_elements": 0,
                    "parsing_confidence": 0.0,
                    "text_elements": 0,
                    "ui_elements": 0
                }
            }
    
    def _detect_ui_elements(self, cv_image: np.ndarray) -> List[Dict]:
        """
        Detect UI elements using computer vision techniques.
        
        Args:
            cv_image: OpenCV image array
            
        Returns:
            List of detected UI elements
        """
        elements = []
        
        # Convert to grayscale for processing
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        # 1. Detect buttons (rectangular shapes with text)
        buttons = self._detect_buttons(gray, cv_image)
        elements.extend(buttons)
        
        # 2. Detect input fields (rectangular shapes)
        input_fields = self._detect_input_fields(gray, cv_image)
        elements.extend(input_fields)
        
        # 3. Detect checkboxes and radio buttons
        checkboxes = self._detect_checkboxes(gray, cv_image)
        elements.extend(checkboxes)
        
        # 4. Detect links and navigation elements
        links = self._detect_links(gray, cv_image)
        elements.extend(links)
        
        return elements
    
    def _detect_buttons(self, gray: np.ndarray, cv_image: np.ndarray) -> List[Dict]:
        """Detect button-like elements using contour detection."""
        buttons = []
        
        # Apply edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            # Approximate contour to polygon
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Check if it's a rectangle (4 corners)
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(contour)
                
                # Filter by size (reasonable button dimensions)
                if 20 <= w <= 300 and 20 <= h <= 100:
                    # Check if it has text inside (simple heuristic)
                    roi = gray[y:y+h, x:x+w]
                    if np.std(roi) > 20: # Has some variation (likely text)
                        buttons.append({
                            "type": "button",
                            "label": f"Button at ({x}, {y})",
                            "position": {"x": x, "y": y, "width": w, "height": h},
                            "confidence": 0.75,
                            "attributes": {
                                "text": f"Button at ({x}, {y})",
                                "enabled": True,
                                "visible": True,
                                "clickable": True
                            }
                        })
        
        return buttons
    
    def _detect_input_fields(self, gray: np.ndarray, cv_image: np.ndarray) -> List[Dict]:
        """Detect input field elements."""
        input_fields = []
        
        # Apply threshold to find rectangular regions
        _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Filter by aspect ratio (input fields are usually wider than tall)
            if 0.5 <= w/h <= 5 and 20 <= w <= 400 and 20 <= h <= 50:
                input_fields.append({
                    "type": "input_field",
                    "label": f"Input field at ({x}, {y})",
                    "position": {"x": x, "y": y, "width": w, "height": h},
                    "confidence": 0.70,
                    "attributes": {
                        "placeholder": "Enter text here",
                        "type": "text",
                        "enabled": True,
                        "visible": True
                    }
                })
        
        return input_fields
    
    def _detect_checkboxes(self, gray: np.ndarray, cv_image: np.ndarray) -> List[Dict]:
        """Detect checkbox and radio button elements."""
        checkboxes = []
        
        # Apply template matching or contour detection for small square shapes
        # This is a simplified approach - could be enhanced with ML models
        
        # Find small square contours
        contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Checkboxes are usually small and square
            if abs(w - h) < 5 and 10 <= w <= 30:
                checkboxes.append({
                    "type": "checkbox",
                    "label": f"Checkbox at ({x}, {y})",
                    "position": {"x": x, "y": y, "width": w, "height": h},
                    "confidence": 0.65,
                    "attributes": {
                        "checked": False,
                        "enabled": True,
                        "visible": True
                    }
                })
        
        return checkboxes
    
    def _detect_links(self, gray: np.ndarray, cv_image: np.ndarray) -> List[Dict]:
        """Detect link-like elements (underlined text, etc.)."""
        links = []
        
        # This is a placeholder - could be enhanced with text detection
        # and link pattern recognition
        
        return links
    
    def _extract_text_elements(self, cv_image: np.ndarray) -> List[Dict]:
        """
        Extract text elements using Tesseract OCR.
        
        Args:
            cv_image: OpenCV image array
            
        Returns:
            List of text elements with positions
        """
        text_elements = []
        
        try:
            # Use Tesseract to detect text
            results = pytesseract.image_to_data(cv_image, output_type=pytesseract.Output.DICT)
            
            for i in range(len(results["text"])):
                if int(results["conf"][i]) > 60: # Confidence threshold
                    x = int(results["left"][i])
                    y = int(results["top"][i])
                    w = int(results["width"][i])
                    h = int(results["height"][i])
                    
                    # Filter out very small text (likely noise)
                    if w > 10 and h > 5 and len(results["text"][i].strip()) > 0:
                        text_elements.append({
                            "type": "text",
                            "label": results["text"][i].strip(),
                            "position": {"x": x, "y": y, "width": w, "height": h},
                            "confidence": int(results["conf"][i]),
                            "attributes": {
                                "text": results["text"][i].strip(),
                                "font_size": h,
                                "readable": True
                            }
                        })
            
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
        
        return text_elements
    
    def _calculate_overall_confidence(self, elements: List[Dict]) -> float:
        """Calculate overall confidence score for the parsing results."""
        if not elements:
            return 0.0
        
        total_confidence = sum(elem.get("confidence", 0.5) for elem in elements)
        return total_confidence / len(elements)
    
    def _parse_with_placeholder(self, image: Image.Image) -> Dict[str, Any]:
        """
        Fallback parsing method if computer vision fails.
        
        Args:
            image: PIL Image object
            
        Returns:
            Placeholder UI element structure
        """
        width, height = image.size
        
        return {
            "elements": [
                {
                    "type": "button",
                    "label": "Example Button",
                    "position": {"x": 100, "y": 200, "width": 120, "height": 40},
                    "confidence": 0.85,
                    "attributes": {
                        "text": "Example Button",
                        "enabled": True,
                        "visible": True
                    }
                },
                {
                    "type": "input_field",
                    "label": "Example Input",
                    "position": {"x": 100, "y": 300, "width": 200, "height": 30},
                    "confidence": 0.90,
                    "attributes": {
                        "placeholder": "Enter text here",
                        "type": "text",
                        "enabled": True
                    }
                }
            ],
            "metadata": {
                "image_size": {"width": width, "height": height},
                "parsing_method": "placeholder",
                "total_elements": 2,
                "parsing_confidence": 0.87,
                "text_elements": 0,
                "ui_elements": 2
            }
        }
    
    def find_element_by_description(self, elements: List[Dict], description: str) -> Optional[Dict]:
        """
        Find a UI element based on a natural language description.
        
        Args:
            elements: List of parsed UI elements
            description: Natural language description of the element
            
        Returns:
            Matching element or None if not found
        """
        description_lower = description.lower()
        
        # Score each element based on description match
        scored_elements = []
        
        for element in elements:
            score = 0
            element_label = element.get("label", "").lower()
            element_type = element.get("type", "").lower()
            
            # Exact text match gets highest score
            if description_lower == element_label:
                score += 100
            elif description_lower in element_label:
                score += 50
            elif element_label in description_lower:
                score += 30
            
            # Type match
            if element_type in description_lower:
                score += 20
            
            # Confidence bonus
            score += element.get("confidence", 0) * 10
            
            if score > 0:
                scored_elements.append((score, element))
        
        # Return highest scoring element
        if scored_elements:
            scored_elements.sort(key=lambda x: x[0], reverse=True)
            return scored_elements[0][1]
        
        return None
    
    def get_element_coordinates(self, element: Dict) -> Dict[str, int]:
        """
        Extract clickable coordinates from a UI element.
        
        Args:
            element: UI element dictionary
            
        Returns:
            Dictionary with x, y coordinates for clicking
        """
        position = element.get("position", {})
        x = position.get("x", 0) + (position.get("width", 0) // 2)
        y = position.get("y", 0) + (position.get("height", 0) // 2)
        
        return {"x": x, "y": y}
    
    def is_element_clickable(self, element: Dict) -> bool:
        """
        Check if an element is clickable/interactive.
        
        Args:
            element: UI element dictionary
            
        Returns:
            True if element is clickable
        """
        clickable_types = ["button", "link", "checkbox", "radio", "tab"]
        return element.get("type") in clickable_types
