from django.db import models

# Create your models here.

class Interview(models.Model):
    questions = models.TextField(unique=True)
    text_before = models.TextField()
    text_after = models.TextField()

    def __str__(self):
        return f"Interview {self.pk}"