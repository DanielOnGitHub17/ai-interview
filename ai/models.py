from django.db import models

# Create your models here.

class ConfigDetails(models.Model):
    # {"last_used": 1719585805.504833, "usage": 14}
    last_used = models.FloatField(default=0)
    usage = models.IntegerField()
