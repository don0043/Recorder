let stream = null,
    audio = null,
    mixedStream = null,
    chunks = [],
    recorder = null,
    startButton = null,
    stopButton = null,
    downloadButton = null,
    recordedVideo = null;


async function setupStream () {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        })
        audio = await navigator.mediaDevices.getUserMedia({
            audio:{
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        })
        setupVideoFeedBack();
    }catch (err){
        console.log(err)
    }
}
function setupVideoFeedBack (){
    if (stream){
        const video = document.querySelector(".recorded-video");
        video.srcObject = stream;
        video.play();
    }else {
        console.warn("No stream")
    }



}
async function startRecording(){
    await setupStream();
    if (stream && audio){
        mixedStream = new MediaStream([
            ...stream.getTracks(),
            ...audio.getTracks(),
        ])
        recorder = new MediaRecorder(mixedStream);
        recorder.ondataavailable = handleDataAvailable;
        recorder.onstop = handleStop;
        recorder.start(200);

        startButton.disabled = true;
        stopButton.disabled = false

        console.log('recording')
    }
    else console.log('warn')
}
function handleDataAvailable (e){
    chunks.push(e.data);

}

function stopRecording (){
    recorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
    console.log('recording stoped')
}

function handleStop(e){
const blob = new Blob(chunks, {
    type: 'video/mp4'
})
    chunks = [];
    downloadButton.href = URL.createObjectURL(blob)
    downloadButton.download = 'video.mp4';
    downloadButton.disabled = false;

    recordedVideo.src = URL.createObjectURL(blob);
    recordedVideo.load();
    recordedVideo.onloadeddata = () => {
        recordedVideo.play();

        const rc = document.querySelector('.download-section')
        rc.classList.remove('hidden')
        rc.scrollIntoView({behavior: "smooth", block: "start"})
    }
    stream.getTracks().forEach(track => track.stop());
    audio.getTracks().forEach(track => track.stop())

    console.log('recording has been saved')
}

window.addEventListener('load',() => {
    startButton = document.querySelector('.start-btn')
    stopButton = document.querySelector('.stop-btn')
    downloadButton = document.querySelector('.download-btn')
    recordedVideo = document.querySelector('.recorded-video')

    startButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);

})
