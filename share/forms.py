from django.forms import ModelForm

from .models import Interview

class InterviewForm(ModelForm):
    
    class Meta:
        model = Interview
        fields = ["questions", "text_before", "text_after"]