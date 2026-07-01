const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const DATALAB_API_KEY = process.env.DATALAB_API_KEY;

async function testCustomPipeline() {
  const filePath = 'c:/Users/MSI/Desktop/dev/my-new-app/Classeur1.pdf'; // Assuming this exists or we can use another file
  
  if (!fs.existsSync(filePath)) {
    console.log("File not found:", filePath);
    return;
  }

  const fd = new FormData();
  fd.append('file', fs.createReadStream(filePath));
  fd.append('pipeline_id', 'handwriting-detection');
  fd.append('mode', 'accurate');
  fd.append('output_format', 'markdown');

  console.log("Submitting to /api/v1/custom-pipeline...");
  try {
    const res = await axios.post('https://www.datalab.to/api/v1/custom-pipeline', fd, {
      headers: {
        'X-API-Key': DATALAB_API_KEY,
        ...fd.getHeaders()
      }
    });
    
    console.log("Submit Response:", res.data);
    const checkUrl = res.data.request_check_url;
    
    console.log("Polling check URL...");
    for(let i=0; i<30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const checkRes = await axios.get(checkUrl, {
        headers: { 'X-API-Key': DATALAB_API_KEY }
      });
      console.log(`Poll ${i+1}: status = ${checkRes.data.status}`);
      if(checkRes.data.status === 'complete') {
        console.log("Result length:", checkRes.data.markdown?.length);
        console.log("Preview:", checkRes.data.markdown?.substring(0, 500));
        break;
      } else if (checkRes.data.status === 'failed') {
        console.log("Failed:", checkRes.data.error);
        break;
      }
    }
  } catch (err) {
    console.error("Error:", err.response?.status, err.response?.data || err.message);
  }
}

testCustomPipeline();
