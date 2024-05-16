from django.urls import path

from . import views

urlpatterns = [
    path("questions/", views.QuestionsFrom.as_view(), name="AI question gen"),
    path("rewrite/", views.QuestionsRewrite.as_view(), name="AI Rewrite"),
]
