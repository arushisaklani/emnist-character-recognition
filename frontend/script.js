const fileInput =
    document.getElementById("fileInput");

const dropZone =
    document.getElementById("dropZone");

const previewBox =
    document.getElementById("previewBox");

const preview =
    document.getElementById("preview");

const removeButton =
    document.getElementById("removeButton");

const predictButton =
    document.getElementById("predictButton");

const apiUrl =
    document.getElementById("apiUrl");


let selectedFile = null;


// ----------------------------------
// Default API URL
// ----------------------------------

apiUrl.value =
    "https://YOUR-RENDER-URL.onrender.com/predict";


// ----------------------------------
// Click upload area
// ----------------------------------

dropZone.addEventListener(
    "click",
    function() {

        fileInput.click();

    }
);


// ----------------------------------
// File selected
// ----------------------------------

fileInput.addEventListener(
    "change",
    function() {

        if (fileInput.files.length > 0) {

            handleFile(
                fileInput.files[0]
            );

        }

    }
);


// ----------------------------------
// Drag and drop
// ----------------------------------

dropZone.addEventListener(
    "dragover",
    function(event) {

        event.preventDefault();

    }
);


dropZone.addEventListener(
    "drop",
    function(event) {

        event.preventDefault();

        if (
            event.dataTransfer.files.length > 0
        ) {

            handleFile(
                event.dataTransfer.files[0]
            );

        }

    }
);


// ----------------------------------
// Handle file
// ----------------------------------

function handleFile(file) {

    if (
        !file.type.startsWith("image/")
    ) {

        alert(
            "Please upload an image."
        );

        return;

    }


    selectedFile = file;


    preview.src =
        URL.createObjectURL(file);


    previewBox.classList.remove(
        "hidden"
    );

}


// ----------------------------------
// Remove image
// ----------------------------------

removeButton.addEventListener(
    "click",
    function() {

        selectedFile = null;

        fileInput.value = "";

        preview.src = "";

        previewBox.classList.add(
            "hidden"
        );

    }
);


// ----------------------------------
// Predict
// ----------------------------------

predictButton.addEventListener(
    "click",
    async function() {


        if (!selectedFile) {

            alert(
                "Please upload an EMNIST image first."
            );

            return;

        }


        let endpoint =
            apiUrl.value.trim();


        if (
            !endpoint ||
            endpoint.includes("YOUR-RENDER-URL")
        ) {

            alert(
                "Please enter your Render API URL."
            );

            return;

        }


        predictButton.disabled = true;

        predictButton.innerText =
            "Predicting...";


        try {


            const formData =
                new FormData();


            formData.append(
                "file",
                selectedFile
            );


            const response =
                await fetch(
                    endpoint,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.error ||
                    "Prediction failed."
                );

            }


            if (data.error) {

                throw new Error(
                    data.error
                );

            }


            showResult(data);


        }

        catch (error) {

            showError(
                error.message
            );

        }

        finally {

            predictButton.disabled =
                false;

            predictButton.innerText =
                "🚀 Predict Character";

        }

    }
);


// ----------------------------------
// Show result
// ----------------------------------

function showResult(data) {


    document.getElementById(
        "emptyResult"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "resultContent"
    ).classList.remove(
        "hidden"
    );


    document.getElementById(
        "prediction"
    ).innerText =
        data.prediction;


    document.getElementById(
        "confidence"
    ).innerText =
        data.confidence + "%";


    document.getElementById(
        "predictedClass"
    ).innerText =
        data.prediction;


    document.getElementById(
        "classIndex"
    ).innerText =
        data.class_index;


    document.getElementById(
        "confidenceScore"
    ).innerText =
        data.confidence + "%";


    const status =
        document.getElementById(
            "status"
        );


    status.className =
        "status success";


    status.innerText =
        "✓ Prediction successful.";

}


// ----------------------------------
// Show error
// ----------------------------------

function showError(message) {


    document.getElementById(
        "emptyResult"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "resultContent"
    ).classList.remove(
        "hidden"
    );


    document.getElementById(
        "prediction"
    ).innerText =
        "Error";


    document.getElementById(
        "confidence"
    ).innerText =
        "-";


    const status =
        document.getElementById(
            "status"
        );


    status.className =
        "status error";


    status.innerText =
        "✕ " + message;

}
