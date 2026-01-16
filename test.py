from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "¡Hola desde Flask!"

if __name__ == "__main__":
    print("Ejecutando test básico de Flask...")
    app.run(debug=True, port=5000)
