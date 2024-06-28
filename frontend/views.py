import os

from django.shortcuts import render
from django.http import HttpResponse, Http404
from share.forms import InterviewForm

def app_view(request):
    # return HttpResponse("Testing AI Interview")
    context = {
        "share_form": InterviewForm(),
    }
    return render(request, "index.html", context)
