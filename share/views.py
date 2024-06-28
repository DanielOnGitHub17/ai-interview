# from django.http import HttpResponseRedirect
# from django.shortcuts import render, redirect
# from django.urls import reverse
# from django.views import View
# import json

# # from .models import Interview
# # Interview = Interview.objects
# # from .forms import InterviewForm
# from helpers import handle_error, message_home
# from frontend.views import app_view

# MAX_STORED_INTERVIEWS = 25

# # Create your views here.
# class Saved(View):
#     def get(self, request, at):
#         try:
#             interview = Interview.get(pk=at)
#             request.SHARED = {
#                 "QUESTIONS": json.loads(interview.questions),
#                 "TEXT_AFTER": interview.text_after,
#                 "TEXT_BEFORE": interview.text_before,
#             }
#         except Exception as error:
#             handle_error(error)
#             return redirect('/')
#         url = request.build_absolute_uri()
#         return message_home(request, f"{url}")
    
#     def post(self, request):
#         try:
#             interview = InterviewForm(request.POST)
#             if interview.is_valid():
#                 if Interview.count() >= MAX_STORED_INTERVIEWS:
#                     Interview.first().delete()
#                 saved = interview.save()
#                 return redirect(f"/share/{saved.pk}/")
#             else:
#                 request.message = "Invalid interview"
#                 return HttpResponseRedirect("/", request)
    
#         except Exception as error:
#             handle_error(error)
#         return redirect("/")