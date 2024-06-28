from django.shortcuts import render

def handle_error(error):
    print(error)
    return error

def message_home(request, message=""):
    context = {
        "message": message
    }
    return render(request, "index.html", context)