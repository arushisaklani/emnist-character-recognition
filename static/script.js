const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


ctx.fillStyle = "black";

ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
);


ctx.strokeStyle = "white";

ctx.lineWidth = 20;

ctx.lineCap = "round";


let drawing = false;


canvas.addEventListener(
    "mousedown",
    () => {

        drawing = true;

        ctx.beginPath();

    }
);


canvas.addEventListener(
    "mouseup",
    () => {

        drawing = false;

        ctx.beginPath();

    }
);


canvas.addEventListener(
    "mousemove",
    draw
);


function draw(event) {

    if (!drawing) {
        return;
    }


    const rect =
        canvas.getBoundingClientRect();


    const x =
        event.clientX - rect.left;

    const y =
        event.clientY - rect.top;


    ctx.lineTo(x, y);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(x, y);

}


async function predict() {

    canvas.toBlob(
        async function(blob) {

            const formData =
                new FormData();


            formData.append(
                "image",
                blob,
                "drawing.png"
            );


            const response =
                await fetch(
                    "/predict",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            document.getElementById(
                "result"
            ).innerText =
                "Prediction: " +
                data.prediction;

        }
    );

}


function clearCanvas() {

    ctx.fillStyle = "black";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    document.getElementById(
        "result"
    ).innerText =
        "Prediction: -";

}
