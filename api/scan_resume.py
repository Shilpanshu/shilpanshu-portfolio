from http.server import BaseHTTPRequestHandler
import json
import os
import google.generativeai as genai

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Configure Gemini
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Server configuration error: Missing API Key"}).encode('utf-8'))
            return

        genai.configure(api_key=api_key)
        
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            resume_text = data.get('resumeText', '')
            job_description = data.get('jobDescription', '')

            if not resume_text or not job_description:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing resume text or job description"}).encode('utf-8'))
                return

            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Act as a strict Applicant Tracking System (ATS) and Senior Recruiter.
            Analyze the following Resume against the Job Description.

            RESUME TEXT:
            {resume_text[:10000]}

            JOB DESCRIPTION:
            {job_description[:5000]}

            Output a VALID JSON object with this exact structure:
            {{
                "score": <number 0-100 based on keyword match and relevance>,
                "missingKeywords": ["<keyword1>", "<keyword2>", ...],
                "criticalFeedback": ["<specific actionable tip 1>", "<tip 2>", ...]
            }}
            
            Do not include markdown formatting (like ```json). Just the raw JSON string.
            """

            response = model.generate_content(prompt)
            text_response = response.text.strip()
            
            # Clean up potential markdown code blocks
            if text_response.startswith("```json"):
                text_response = text_response[7:]
            if text_response.startswith("```"):
                text_response = text_response[3:]
            if text_response.endswith("```"):
                text_response = text_response[:-3]

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(text_response.encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept")
        self.end_headers()
