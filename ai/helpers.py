import google.generativeai as genai
import json
import os

from .models import config
from datetime import datetime

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# make all a class later
interview_model = genai.GenerativeModel("gemini-pro")
more_queries = "your response should be straightforward. "\
                "Do not go too broad. "\
                "the questions should not be 'WH' questions. "\
                "Give the answer in json array of strings. "\
                "{questions: [...]}. "\
                "add nothing else to the answer. "\
                "be a bit interactive."
   
def save_config(**kwargs):
    for prop in kwargs:
        setattr(config, prop, kwargs[prop])
    config.save()

def can_use():
    now, last_used = datetime.now().timestamp(), config.last_used
    time_past = now - last_used
    usage = config.usage
    if datetime.fromtimestamp(last_used).date() != datetime.now().date():
        # reset usage: another day
        save_config(usage=0)
    # used in the past 40 seconds or usage is okay for today
    if time_past < 40 or usage >= 40:
        return False
    # reset last_used as last called
    save_config(last_used=datetime.now().timestamp(), usage=usage+1)
    return True
    

def questions_from_topic(topic, number):
    return can_use() and interview_model.generate_content(
        f"Generate {number} questions on the topic '{topic}'" + more_queries
    ).text
    
def questions_from_text(text, number):
    return can_use() and interview_model.generate_content(
        f"Generate {number} questions on this text: {text}" + more_queries
    ).text


def rewrite_all(questions, number):
    if can_use():
        various = interview_model.generate_content(
            f"Rewrite each question in {questions} in {number} different ways, keeping the meaning of each. "
            "none of your answers can be the same as the question I provide. "
            "return your answer in a json format. "
            ". whereby your return value is a list of lists containing strings, "
            f"and your return value's length is the same as that in {questions}"
        ).text
        return various[various.find('[') : various.rfind(']')+1]
    return can_use()


#  test returns

            # return HttpResponse(
            #     json.dumps(
            #         {"questions": [random() for i in range(number)]}
            #         )
            #     )  # testing


            # return HttpResponse(
            #     json.dumps(
            #         [[random() for i in range(5)] for x in questions]
            #         )
            #     )