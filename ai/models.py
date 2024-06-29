from django.db import models

class ConfigDetails(models.Model):
    # I was wrong to override the save method - now I can't really keep trak
    # I should override it in only one condition
    last_used = models.FloatField(default=0)
    usage = models.IntegerField()

    def save(self):
        if self == ConfigDetails.get_config():
            super().save()
    
    @staticmethod
    def get_config():
        return ConfigDetails.objects.all()[0]