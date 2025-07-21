from django.db import models

class ConfigDetails(models.Model):
    last_used = models.FloatField(default=0)
    usage = models.IntegerField(default=0)
    
    @staticmethod
    def get_config():
        return ConfigDetails.objects.get_or_create(pk=1)[0]
