from django.db import models

# Create your models here.

class ConfigDetails(models.Model):
    # {"last_used": 1719585805.504833, "usage": 14}
    # I created an instance on the server and overrode the save method :)
    last_used = models.FloatField(default=0)
    usage = models.IntegerField()

    def save(self):
        pass

config = ConfigDetails.objects.all()[0]  # Will change on Gemini query