import pytest
from app.processors.text_processor import TextProcessor, TextProcessingError


class TestTextProcessor:
    def test_uppercase_operation(self):
        input_text = "Hello Dolly, Welcome to AI Platform!"
        expected = "HELLO DOLLY, WELCOME TO AI PLATFORM!"
        result, log = TextProcessor.process("UPPERCASE", input_text)
        assert result == expected
        assert "uppercase" in log.lower()

    def test_lowercase_operation(self):
        input_text = "Hello Dolly, Welcome to AI Platform!"
        expected = "hello dolly, welcome to ai platform!"
        result, log = TextProcessor.process("LOWERCASE", input_text)
        assert result == expected
        assert "lowercase" in log.lower()

    def test_reverse_string_operation(self):
        input_text = "Hello World"
        expected = "dlroW olleH"
        result, log = TextProcessor.process("REVERSE_STRING", input_text)
        assert result == expected
        assert "reversed" in log.lower()

    def test_reverse_string_with_space_in_name(self):
        input_text = "AI Task Platform"
        result, _ = TextProcessor.process("REVERSE STRING", input_text)
        assert result == "mroftalP ksaT IA"

    def test_word_count_operation(self):
        input_text = "I am learning MERN stack development."
        expected = 6
        result, log = TextProcessor.process("WORD_COUNT", input_text)
        assert result == expected
        assert "6 words" in log

    def test_word_count_with_multiple_whitespace(self):
        input_text = "   Leading,   multiple   spaces  and trailing.   "
        result, _ = TextProcessor.process("WORD_COUNT", input_text)
        assert result == 5

    def test_word_count_empty_string(self):
        result, _ = TextProcessor.process("WORD_COUNT", "   ")
        assert result == 0

    def test_unsupported_operation_raises_error(self):
        with pytest.raises(TextProcessingError) as exc_info:
            TextProcessor.process("NON_EXISTENT_OP", "sample")
        assert "Unsupported operation" in str(exc_info.value)

    def test_none_input_raises_error(self):
        with pytest.raises(TextProcessingError):
            TextProcessor.process("UPPERCASE", None)
