from django.shortcuts import render
from django.http import HttpResponse
from django.views import View

import json
# from random import random
from .helpers import questions_from_text, questions_from_topic, rewrite_all
from helpers import handle_error

class QuestionsFrom(View):
    def post(self, request):
        result = "Failed"
        try:
            details = json.loads(request.body)
            number = details["number"]
            for content in ("topic", "text"):
                if content in details:
                    result = eval(f"questions_from_{content}")(details[content], number)
                    # Could try loadsing result to see if valid
                    break
            else:
                result = "Passed"
        except Exception as error:
            handle_error(error)
        return HttpResponse(result)

class QuestionsRewrite(View):
    def post(self, request):
        result = "Failed"
        try:
            questions = json.loads(request.body)
            result = rewrite_all(questions, 5)
        except Exception as error:
            handle_error(error)
        return HttpResponse(result)