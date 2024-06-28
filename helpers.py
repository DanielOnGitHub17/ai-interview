from django.shortcuts import render

def handle_error(error):
    print(error)
    with open("errors.txt", 'a') as file:
        file.write(f"{str(error)}\n")
    return error

def message_home(request, message=""):
    context = {
        "message": message
    }
    return render(request, "index.html", context)