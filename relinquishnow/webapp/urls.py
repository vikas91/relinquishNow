"""webapp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
from django.urls import include, path
from webapp.views import * 


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', Index.as_view()),
    path('signup/', SignUp.as_view()),
    path('login/', Login.as_view()),
    path('logout/', Logout.as_view()),
    path('user/<userId>/', UserProfile.as_view()),
    path('user/<userId>/images/', UserImages.as_view()),
    path('user/<userId>/edit/', UserProfileEdit.as_view()),
    path('helpcenters/', HelpCenterList.as_view()),
    path('helpcenter/<hcId>/', HelpCenterProfile.as_view()),
    path('contact/', ContactUs.as_view())
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
