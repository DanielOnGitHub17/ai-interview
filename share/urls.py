from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    path("<int:at>/", views.Saved.as_view(), name="Saved link"),
    path("", views.Saved.as_view(), name="Save questions"),
]