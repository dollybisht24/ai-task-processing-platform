import re
from typing import Any, Tuple


class TextProcessingError(Exception):
    """Custom exception for text processing errors"""
    pass


class TextProcessor:
    """
    Executes specified text operations deterministically and accurately.
    Supported operations:
      1. UPPERCASE
      2. LOWERCASE
      3. REVERSE STRING / REVERSE_STRING
      4. WORD COUNT / WORD_COUNT
    """

    @staticmethod
    def normalize_operation_name(operation: str) -> str:
        if not operation:
            return ""
        return re.sub(r"[\s-]+", "_", operation.strip().upper())

    @classmethod
    def process(cls, operation: str, text: str) -> Tuple[Any, str]:
        """
        Executes text processing on input text.
        Returns: (result, log_message)
        """
        if text is None:
            raise TextProcessingError("Input text cannot be None")

        normalized_op = cls.normalize_operation_name(operation)

        if normalized_op == "UPPERCASE":
            result = text.upper()
            return result, f"Converted {len(text)} characters to uppercase."

        elif normalized_op == "LOWERCASE":
            result = text.lower()
            return result, f"Converted {len(text)} characters to lowercase."

        elif normalized_op in ("REVERSE_STRING", "REVERSE"):
            # Reverses string characters completely
            result = text[::-1]
            return result, f"Reversed string of {len(text)} characters."

        elif normalized_op in ("WORD_COUNT", "COUNT_WORDS"):
            # Splits on all contiguous whitespace; empty string yields 0
            words = text.strip().split()
            count = len(words) if text.strip() else 0
            return count, f"Counted {count} words across {len(text)} characters."

        else:
            supported = ["UPPERCASE", "LOWERCASE", "REVERSE_STRING", "WORD_COUNT"]
            raise TextProcessingError(
                f"Unsupported operation '{operation}'. Supported operations: {', '.join(supported)}"
            )
