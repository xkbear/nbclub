from django import forms
from django.contrib.auth.forms import AuthenticationForm


VIEWER_USERNAME = "viewer"


class SharedPasswordForm(AuthenticationForm):
    username = forms.CharField(required=False, widget=forms.HiddenInput)

    def clean(self):
        # The public form accepts only a password, even if a username is posted manually.
        self.cleaned_data["username"] = VIEWER_USERNAME
        return super().clean()
