import google.generativeai as genai
import json
import os

from .models import ConfigDetails
from datetime import datetime

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# make all a class later
interview_model = genai.GenerativeModel("gemini-pro")
more_queries = "your response should be straightforward. "\
                "Do not go too broad. "\
                "the questions should not start with 'WH'. "\
                "Give the answer in json array of strings. "\
                "['question1', 'question2', ...]. "\
                "add nothing else to the answer. "\
                "be a bit interactive."

def save_config(config, **kwargs):
    for prop in kwargs:
        setattr(config, prop, kwargs[prop])
    config.save()

def can_use():
    config = ConfigDetails.get_config()
    now, last_used = datetime.now().timestamp(), config.last_used
    time_past = now - last_used
    usage = config.usage
    if datetime.fromtimestamp(last_used).date() != datetime.now().date():
        # reset usage: another day
        save_config(config, usage=0)
    # used in the past 40 seconds or usage is okay for today
    if time_past < 40 or usage >= 40:
        return False
    # reset last_used as last called
    save_config(config, last_used=datetime.now().timestamp(), usage=usage+1)
    return True
    

def questions_from_topic(topic, number):
    return can_use() and remove_outliers(interview_model.generate_content(
        f"Generate {number} questions on the topic '{topic}'" + more_queries
    ).text)
    
def questions_from_text(text, number):
    return can_use() and remove_outliers(interview_model.generate_content(
        f"Generate {number} questions on this text: {text}" + more_queries
    ).text)


def rewrite_all(questions, number):
    return can_use() and remove_outliers(interview_model.generate_content(
            f"Rewrite each question in {questions} in {number} different ways, keeping the meaning of each. "
            "none of your answers can be the same as the question I provide. "
            "return your answer in a json format. "
            ". whereby your return value is a list of lists containing strings, "
            f"and your return value's length is the same as that in {questions}"
        ).text)

def remove_outliers(text):
    return text[text.find('[') : text.rfind(']')+1]
