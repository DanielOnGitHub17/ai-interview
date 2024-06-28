# from django.shortcuts import render
# from django.http import HttpResponse
# from django.views import View

# # Create your views here.
# import json
# # from random import random
# from .helpers import questions_from_text, questions_from_topic, rewrite_all
# from helpers import handle_error

# # Both views assumes that Gemini returns perfect json/false 
# class QuestionsFrom(View):
#     def post(self, request):
#         result = "Failed"
#         try:
#             details = json.loads(request.body)
#             number = details["number"]
#             if "topic" in details:
#                 result = questions_from_topic(details["topic"], number)
#             elif "text" in details:
#                 result = questions_from_text(details["text"], number)
#             else:
#                 result = "Passed"
#         except Exception as error:
#             handle_error(error)
#         return HttpResponse(result)

# class QuestionsRewrite(View):
#     def post(self, request):
#         result = "Failed"
#         try:
#             questions = json.loads(request.body)
#             result = rewrite_all(questions, 5)
#         except Exception as error:
#             handle_error(error)
#         return HttpResponse(result)