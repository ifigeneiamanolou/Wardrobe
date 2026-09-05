// Custom hook to handle incoming streaming data from the backend (in the form of JSON messages)
import showAlert from "../components/alert";
const useStreaming = () => {
    const receiveStreamingMessage = async(
        url : string,
        onChunk : (chunk : string) => void,
        onComplete : () => void
    ) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);          // configure the asychronous request
        xhr.setRequestHeader('Content-Type', 'application/json');

        var buffer = "";
        xhr.send();                           // send a request

        // Event listeners
        xhr.onerror = () => {
            showAlert('Error', 'Network error');
        };

        xhr.onload = () => {
            console.log(`Finished with status ${xhr.status}`);
            onComplete();
        };

        xhr.onprogress = () => {   // Triggered periodically
            const data = xhr.response.substring(xhr.responseText.length);
            buffer = buffer + data;
            const lines = buffer.split('/n');
            for(var i = 0; i < lines.length; i ++){
                onChunk(lines[i]);
            };
        };

        xhr.onloadend = () => {
            if(buffer.trim()){
                onChunk(buffer.trim());
            };
        };

        return () => {
            xhr.abort();        // cleanup
        }
    }

    return {receiveStreamingMessage};
}

export default useStreaming;