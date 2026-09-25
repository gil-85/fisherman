const fs = require("fs");
const path = require("path");
const { exec, spawn } = require("child_process");

console.log("running");


// ============================================================
// CAMERA SETUP
// ============================================================

const cameraPath = path.join(
    __dirname,
    "camera",
    "CameraCapture.exe"
);

const picsFolder = path.join(
    __dirname,
    "pics"
);

// Create pics folder if it doesn't exist
fs.mkdirSync(picsFolder, { recursive: true });


// ============================================================
// CAMERA FUNCTION
// ============================================================

let isTraping = false;

function takePics(num) {

    const filename = path.join(
        picsFolder,
        `fish-${num}.jpg`
    );

    console.log("Taking picture:", filename);

    const camera = spawn(
        cameraPath,
        [filename],
        {
            windowsHide: true
        }
    );

    camera.on("error", (error) => {
    console.error("Could not start CameraCapture.exe:");
    console.error(error.message);
});

    // Camera program output
    camera.stdout.on("data", (data) => {

        console.log(
            data.toString().trim()
        );

    });


    // Camera program errors
    camera.stderr.on("data", (data) => {

        console.error(
            data.toString().trim()
        );

    });


    // Camera program finished
    camera.on("close", (code) => {

        if (code !== 0) {

            console.error(
                "Camera failed. Exit code:",
                code
            );

            return;
        }


        console.log(
            "Picture saved:",
            filename
        );


        // Take another picture
        if (num > 0) {

            setTimeout(() => {

                takePics(num - 1);

            }, 1000);

        }


        // No more pictures
        else {

            console.log(
                "Locking Windows..."
            );

            exec(
                "rundll32.exe user32.dll,LockWorkStation"
            );

        }

    });

}


// ============================================================
// KEYBOARD INPUT
// ============================================================

process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("data", (key) => {

    const input = key.toString();


    // & = quit
    if (input === "&") {

        process.exit();

    }


    // Any other key triggers the camera
    else {

        if (!isTraping) {

            isTraping = true;

            takePics(2);

        }

    }

});


// ============================================================
// MOUSE MOVEMENT DETECTION
// ============================================================

const powershell = spawn(
    "powershell.exe",
    [
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-Command",

        `
        Add-Type -AssemblyName System.Windows.Forms

        $lastX = [System.Windows.Forms.Cursor]::Position.X
        $lastY = [System.Windows.Forms.Cursor]::Position.Y

        while ($true) {

            $pos = [System.Windows.Forms.Cursor]::Position

            $x = $pos.X
            $y = $pos.Y

            $dx = [Math]::Abs($x - $lastX)
            $dy = [Math]::Abs($y - $lastY)

            if ($dx -ge 50 -or $dy -ge 50) {

                Write-Output "MOVE"

                $lastX = $x
                $lastY = $y
            }

            Start-Sleep -Milliseconds 50
        }
        `
    ]
);


// ============================================================
// MOUSE EVENT RECEIVED
// ============================================================

powershell.stdout.on("data", (data) => {

    const message = data.toString().trim();


    if (message.includes("MOVE")) {

        if (!isTraping) {

            isTraping = true;

            takePics(2);

        }

    }

});