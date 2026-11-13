from getpass import getpass

from django.contrib.auth import get_user_model, password_validation
from django.core.management.base import BaseCommand, CommandError
from django.core.exceptions import ValidationError

from stats.forms import VIEWER_USERNAME


class Command(BaseCommand):
    help = "Create or rotate the shared dashboard viewer password without displaying it."

    def handle(self, *args, **options):
        password = getpass("看板共享密码：")
        confirmation = getpass("再输一次：")
        if not password or password != confirmation:
            raise CommandError("两次密码不一致，或密码为空。")

        user_model = get_user_model()
        viewer = user_model.objects.filter(username=VIEWER_USERNAME).first()
        try:
            password_validation.validate_password(password, user=viewer)
        except ValidationError as error:
            raise CommandError("；".join(error.messages)) from error

        if viewer is None:
            viewer = user_model(username=VIEWER_USERNAME)
        viewer.is_active = True
        viewer.is_staff = False
        viewer.is_superuser = False
        viewer.set_password(password)
        viewer.save()
        self.stdout.write(self.style.SUCCESS("看板共享密码已设置。"))
