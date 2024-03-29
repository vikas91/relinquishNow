import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.http.response import HttpResponse, HttpResponseRedirect, Http404, \
    JsonResponse
from django.middleware import csrf
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View

from api.models import User, HelpCenter, ContactRequest, UserImage, Item
from api.serializers import UserSerializer, ContactRequestSerializer
from rest_framework import status
from rest_framework.response import Response


# This renders page based on user session status
# If user is not logged in return index.html else return home.html 
class Index(View):
    def get(self, request):
        if request.user.is_authenticated:
            response = render(request, 'home.html', {"active_user": request.user})
        else:
            response = render(request, 'index.html', {})
            response.set_cookie(key='csrftoken', value=csrf.get_token(request))
        
        return response


class SignUp(View):
    # This renders a sign up page to sign up a user.
    # If user is already logged in redirects to home page
    def get(self, request):
        if request.user.is_authenticated:
            return HttpResponseRedirect("/")
        
        response = render(request, 'signup.html', {})
        response.set_cookie(key='csrftoken', value=csrf.get_token(request))
        return response
    
    # This adds user details from sign up form to user table.
    # If user with email already exists raises a 400 response
    def post(self, request):
        data = json.loads(request.POST.get('data', '{}'))
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            userObj = User.objects.get(user_email=data.get("user_email"))
            userObj.set_password(data.get("user_password"))
            userObj.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)


class Login(View):
    # This renders login page based on user session status
    # If user is already logged redirect to index view else render login page
    def get(self, request):
        if request.user.is_authenticated:
            return HttpResponseRedirect("/")
        
        response = render(request, 'login.html', {})
        response.set_cookie(key='csrftoken', value=csrf.get_token(request))
        return response
    
    # This will authenticate the user credentials and create the user session
    # User object is saved in request going forward    
    def post(self, request):
        response_data = {
            "status": "Failure",
            "http_status_code": 401
        }
        username = request.POST['user_login_email']
        password = request.POST['user_login_password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            response_data["status"] = "Success"
            response_data["http_status_code"] = 200
                
            if user.is_deleted:
                response_data["error_reason"] = "Account has been deleted"
                response_data["http_status_code"] = 403
    
        else:
            response_data["error_reason"] = "Invalid Username/Password"
    
        return HttpResponse(json.dumps(response_data), status=response_data["http_status_code"])

    
# This deleted the current user session and redirects back to home page
class Logout(View):
    def get(self, request):
        logout(request)
        return HttpResponseRedirect("/")
    

class Items(View):
    @method_decorator(login_required)
    def get(self, request, item_id):
        response = render(request, 'items.html', {})
        return response

# This loads the profile page
# This page shows the user followers, following list, item list
class UserProfile(View):
    @method_decorator(login_required)
    def get(self, request, userId):
#         try:
            user_details = User.objects.get(user_id=userId)
            current_user = request.user
            user_profile_image = UserImage.objects.filter(user=user_details, image_is_current=True)
            user_items = Item.objects.filter(item_creator__user_id=userId)
            is_editable = True if user_details.user_id == current_user.user_id else False
                
            context = {'user_details': user_details,
                       'active_user': current_user,
                       'is_editable': is_editable,
                       'user_profile_image': user_profile_image,
                       'user_items': user_items 
                       }
            response = render(request, 'profile.html', context)
            return response
#         except:
#             raise Http404('User with this userId doesnt exist')

# This loads the profile page
# This page shows the user followers, following list, item list
class UserImages(View):
    @method_decorator(login_required)
    def get(self, request, userId):
        try:
            user_details = User.objects.get(user_id=userId)
            user_images = UserImage.objects.filter(user=user_details)
            is_editable = True if user_details.user_id == request.user.user_id else False
            context = {
                'user_details': user_details,
                'user_images': user_images,
                'is_editable' : is_editable
            }
            response = render(request, 'carousals/images.html', context)
            return response
        except:
            raise Http404('User with this userId doesnt exist')
        
    
    @method_decorator(login_required)
    def post(self, request, userId):
        try:
            profile_image = request.FILES.get('profile_image')
            print(profile_image.name)
            if not profile_image:
                return JsonResponse({"error": "Image File Is Required"}, status=400)
            
            user_details = User.objects.get(user_id=userId)
            print(UserImage.objects.filter(user=user_details, image=profile_image.name).query)
            if not UserImage.objects.filter(user=user_details, image=profile_image.name):
                UserImage.objects.filter(user=user_details).update(image_is_current=False)
                user_image_obj = UserImage(user=user_details, image=profile_image)
                user_image_obj.full_clean()
                user_image_obj.save()
            
            user_images = UserImage.objects.filter(user=user_details)
            is_editable = True if user_details.user_id == request.user.user_id else False
            
            context = {
                'user_details': user_details,
                'user_images': user_images,
                'is_editable' : is_editable
            }
            response = render(request, 'carousals/images.html', context)
            return response
            
            
        except:
            raise Http404('User with this userId doesnt exist')



class UserProfileEdit(View):
    # This loads the profile page edit page
    # This page shows the user account details, contact details
    @method_decorator(login_required)
    def get(self, request, userId):
        try:
            user_details = User.objects.get(user_id=userId)
            current_user = request.user
            if user_details.user_id == current_user.user_id:
                context = {'user_details': user_details,
                           'active_user': current_user,
                           }
                response = render(request, 'profile-edit.html', context)
                return response
            else:
                raise Http404('User not allowed to edit this profile')
        except:
            raise Http404('User not allowed to edit this profile / User with this userId doesnt exist')

    # This updates the user profile details
    # Throws 400 if we try to edit other user profile 
    @method_decorator(login_required)
    def post(self, request, userId):
        data = json.loads(request.POST.get('data', '{}'))
        user_details = User.objects.get(user_id=userId)
        serializer = UserSerializer(user_details, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)   
        


class HelpCenterList(View):
    @method_decorator(login_required)
    def get(self, request):
        hc_list = HelpCenter.objects.all()
        context = {'hc_list': hc_list}  
        response = render(request, 'hc-list.html', context)
        return response

    
class HelpCenterProfile(View):
    @method_decorator(login_required)
    def get(self, request, hcId):
        hc_list = HelpCenter.objects.filter(hc_id=hcId)
        if hc_list:
            hc_details = hc_list[0]
        context = {'hc_details': hc_details}  
        response = render(request, 'helpcenter.html', context)
        return response
        

class ContactUs(View):
    def get(self, request):
        response = render(request, 'contactus.html', {})
        response.set_cookie(key='csrftoken', value=csrf.get_token(request))
        return response
    
    def post(self, request):
        data = json.loads(request.POST.get('data', '{}'))
        serializer = ContactRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)

