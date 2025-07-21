import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from django.test import TestCase

from .helpers import (
    ask_gemini, save_config, can_use, questions_from_topic,
    questions_from_text, rewrite_all, remove_outliers, MORE_QUERIES
)


class TestHelpers(TestCase):
    
    def setUp(self):
        self.mock_config = Mock()
        self.mock_config.last_used = datetime.now().timestamp()
        self.mock_config.usage = 0
        self.mock_config.save = Mock()

    def test_save_config(self):
        # Arrange
        mock_config = Mock()
        
        # Act
        save_config(mock_config, usage=5, last_used=123456)
        
        # Assert
        self.assertEqual(mock_config.usage, 5)
        self.assertEqual(mock_config.last_used, 123456)
        mock_config.save.assert_called_once()

    @patch('ai.helpers.ConfigDetails')
    @patch('ai.helpers.datetime')
    @patch('ai.helpers.save_config')
    def test_can_use_new_day_resets_usage(self, mock_save_config, mock_datetime, mock_config_details):
        # Arrange
        yesterday = datetime.now() - timedelta(days=1)
        mock_config = Mock()
        mock_config.last_used = yesterday.timestamp()
        mock_config.usage = 30
        mock_config_details.get_config.return_value = mock_config
        
        mock_now = datetime.now()
        mock_datetime.now.return_value = mock_now
        mock_datetime.fromtimestamp.return_value = yesterday
        
        # Act
        result = can_use()
        
        # Assert
        self.assertTrue(result)
        # Check that save_config was called to reset usage and then increment
        self.assertEqual(mock_save_config.call_count, 2)
        # First call resets usage to 0, second call increments to 1
        mock_save_config.assert_any_call(mock_config, usage=0)

    @patch('ai.helpers.ConfigDetails')
    @patch('ai.helpers.datetime')
    def test_can_use_rate_limited_by_time(self, mock_datetime, mock_config_details):
        # Arrange
        now = datetime.now()
        mock_config = Mock()
        mock_config.last_used = now.timestamp() - 30  # 30 seconds ago
        mock_config.usage = 5
        mock_config_details.get_config.return_value = mock_config
        
        mock_datetime.now.return_value = now
        mock_datetime.fromtimestamp.return_value = now
        
        # Act
        result = can_use()
        
        # Assert
        self.assertFalse(result)

    @patch('ai.helpers.ConfigDetails')
    @patch('ai.helpers.datetime')
    def test_can_use_rate_limited_by_usage(self, mock_datetime, mock_config_details):
        # Arrange
        now = datetime.now()
        mock_config = Mock()
        mock_config.last_used = now.timestamp() - 60  # 60 seconds ago
        mock_config.usage = 40  # At limit
        mock_config_details.get_config.return_value = mock_config
        
        mock_datetime.now.return_value = now
        mock_datetime.fromtimestamp.return_value = now
        
        # Act
        result = can_use()
        
        # Assert
        self.assertFalse(result)

    @patch('ai.helpers.can_use')
    @patch('ai.helpers.ask_gemini')
    @patch('ai.helpers.remove_outliers')
    def test_questions_from_topic_success(self, mock_remove_outliers, mock_ask_gemini, mock_can_use):
        # Arrange
        mock_can_use.return_value = True
        mock_ask_gemini.return_value = 'some response with ["q1", "q2"]'
        mock_remove_outliers.return_value = '["q1", "q2"]'
        
        # Act
        result = questions_from_topic("Python", 2)
        
        # Assert
        self.assertEqual(result, '["q1", "q2"]')
        mock_ask_gemini.assert_called_once_with(
            "Generate 2 questions on the topic 'Python'" + MORE_QUERIES
        )

    @patch('ai.helpers.can_use')
    def test_questions_from_topic_rate_limited(self, mock_can_use):
        # Arrange
        mock_can_use.return_value = False
        
        # Act
        result = questions_from_topic("Python", 2)
        
        # Assert
        self.assertFalse(result)

    @patch('ai.helpers.can_use')
    @patch('ai.helpers.ask_gemini')
    @patch('ai.helpers.remove_outliers')
    def test_questions_from_text_success(self, mock_remove_outliers, mock_ask_gemini, mock_can_use):
        # Arrange
        mock_can_use.return_value = True
        mock_ask_gemini.return_value = 'response with ["q1", "q2"]'
        mock_remove_outliers.return_value = '["q1", "q2"]'
        
        # Act
        result = questions_from_text("Sample text", 2)
        
        # Assert
        self.assertEqual(result, '["q1", "q2"]')
        mock_ask_gemini.assert_called_once_with(
            "Generate 2 questions on this text: Sample text" + MORE_QUERIES
        )

    @patch('ai.helpers.can_use')
    @patch('ai.helpers.ask_gemini')
    @patch('ai.helpers.remove_outliers')
    def test_rewrite_all_success(self, mock_remove_outliers, mock_ask_gemini, mock_can_use):
        # Arrange
        mock_can_use.return_value = True
        questions = ["What is Python?", "How does it work?"]
        mock_ask_gemini.return_value = 'response with [["q1a", "q1b"], ["q2a", "q2b"]]'
        mock_remove_outliers.return_value = '[["q1a", "q1b"], ["q2a", "q2b"]]'
        
        # Act
        result = rewrite_all(questions, 2)
        
        # Assert
        self.assertEqual(result, '[["q1a", "q1b"], ["q2a", "q2b"]]')
        expected_prompt = (
            f"Rewrite each question in {questions} in 2 different ways, keeping the meaning of each. "
            "none of your answers can be the same as the question I provide. "
            "return your answer in a json format. "
            ". whereby your return value is a list of lists containing strings, "
            f"and your return value's length is the same as that in {questions}. "
            "Make sure you return a valid json array. "
            "Escape apostrophes in strings as required. "
        )
        mock_ask_gemini.assert_called_once_with(expected_prompt)

    def test_remove_outliers_valid_json(self):
        # Arrange
        text = 'Some text before ["question1", "question2"] some text after'
        
        # Act
        result = remove_outliers(text)
        
        # Assert
        self.assertEqual(result, '["question1", "question2"]')

    def test_remove_outliers_nested_brackets(self):
        # Arrange
        text = 'Text [["q1", "q2"], ["q3", "q4"]] more text'
        
        # Act
        result = remove_outliers(text)
        
        # Assert
        self.assertEqual(result, '[["q1", "q2"], ["q3", "q4"]]')

    def test_remove_outliers_no_brackets(self):
        # Arrange
        text = 'No brackets here'
        
        # Act
        result = remove_outliers(text)
        
        # Assert
        self.assertEqual(result, '')

    def test_remove_outliers_only_opening_bracket(self):
        # Arrange
        text = 'Only opening [ bracket'
        
        # Act
        result = remove_outliers(text)
        
        # Assert
        self.assertEqual(result, '')

    def test_ask_gemini_integration(self):
        # Integration test - actually calls Gemini API
        # Arrange
        test_prompt = "Harry Potter and the Half Blood Prince"
        
        # Act
        result = ask_gemini(test_prompt)
        
        # Assert
        self.assertIsNotNone(result)
        self.assertIsInstance(result, str)
        self.assertGreater(len(result), 0)
        # Check that we get some response about Harry Potter
        self.assertIn("Harry Potter", result)
        # Assert
        print(f"Response from Gemini: {result}")
        self.assertEqual(result, '')
