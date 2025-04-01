from django.db import models
from django.utils import timezone

# Create your models here.
class PasswordResetOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    def is_valid(self):
        # OTP valid for 10 minutes
        return not self.is_used and (timezone.now() - self.created_at).total_seconds() < 600
