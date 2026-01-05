import { Profile, Experience, Education, SkillCategory, Project } from './types';

export const PROFILE: Profile = {
  name: "Shilpanshu",
  title: "Assistant Manager – R&D | Computer Vision & Automation",
  email: "shilpanshu2002@gmail.com",
  phone: "+91 911-014-8297",
  location: "New Delhi, India",
  summary: "Emerging fashion-tech engineer from NIFT New Delhi passionate about building next-gen Virtual Try-On (VTO) and AR experiences. I blend apparel domain knowledge with strong technical skills in Unity, ONNX AI models, depth sensors, and real-time body tracking to create high-performance digital try-on systems. I aim to drive innovation at the intersection of fashion, computer vision, and immersive technology.",
  linkedin: "https://www.linkedin.com/in/shilpanshu-09232b161/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
  website: "www.shilpanshu.site"
};

export const EXPERIENCE: Experience[] = [
  {
    id: "exp1",
    role: "Assistant Manager - R&D",
    company: "Apparel 4.0 Technologies Pvt. Ltd.",
    period: "June 2025 - Present",
    location: "Delhi, India",
    description: [
      "Added new features and improvements to the company’s iSmart desktop application.",
      "Set up internal dashboards to give decision-makers real-time visibility of client status and project updates.",
      "Tested and evaluated CV/AI models like DINO and SAM to select the best pipeline for upcoming products.",
      "Designed and experimented with computer vision and ML-based video analysis pipelines for manufacturing."
    ]
  },
  {
    id: "exp2",
    role: "Independent Researcher (Graduation Project)",
    company: "Shahi Chair, NIFT",
    period: "Jan 2025 - May 2025",
    location: "New Delhi, India",
    description: [
      "Developed a full Virtual Try-On (VTO) system integrating pose tracking, segmentation, and Unity-based garment overlay.",
      "Built end-to-end real-time AR pipelines using models like BlazePose and RVM, achieving a fully functional prototype.",
      "Awarded a ₹1,00,000 scholarship for excellence and innovation in VTO development."
    ]
  },
  {
    id: "exp3",
    role: "Freelance Graphic Designer",
    company: "Freelance",
    period: "June 2022 - Nov 2024",
    location: "Remote",
    description: [
      "Worked with digital assets, visual communication, and client requirements.",
      "Developed strong stakeholder communication and delivery discipline."
    ]
  },
  {
    id: "exp4",
    role: "Digital Marketing Consultant",
    company: "PlayKar Digital",
    period: "Sep 2023 - Sep 2024",
    location: "Delhi, India",
    description: ["Managed digital marketing strategies and consultation."]
  },
  {
    id: "exp5",
    role: "Apparel Internship Trainee",
    company: "VAMANI OVERSEAS PRIVATE LIMITED",
    period: "June 2024 - July 2024",
    location: "Noida, UP",
    description: ["Industrial internship focused on apparel manufacturing processes."]
  }
];

export const EDUCATION: Education[] = [
  {
    school: "National Institute of Fashion Technology (NIFT), Delhi",
    degree: "Bachelor of Fashion Technology (B.F.Tech)",
    period: "Aug 2021 - Aug 2025",
    details: [
      "At National Institute of Fashion Technology (NIFT), New Delhi, I developed a strong foundation in fashion technology, garment manufacturing, and product development, while increasingly focusing on the intersection of fashion and technology.",
      "During my time there, I worked on hands-on projects involving apparel processes, data-driven decision-making, and emerging technologies such as computer vision and virtual try-on systems.",
      "My graduation project explored real-time Virtual Try-On using depth sensors and AI, reflecting my interest in applying engineering, software, and research to solve real problems in the apparel industry."
    ]
  },
  {
    school: "De Nobili School",
    degree: "High School",
    period: "March 2006 - March 2018",
    details: []
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "3D & AR",
    skills: ["Unity (HDRP, Sentis, AR Foundation)", "Blender", "Clo3D", "Fusion 360", "AutoCAD 3D"],
    level: 95
  },
  {
    name: "AI & Computer Vision",
    skills: ["Pose Estimation (BlazePose, OpenPose)", "Segmentation (RVM, MODNet)", "ONNX", "DINO", "SAM"],
    level: 90
  },
  {
    name: "Development",
    skills: ["Python", "C++", "Web Development", "Unity Sentis"],
    level: 85
  },
  {
    name: "Hardware & IoT",
    skills: ["Arduino", "Raspberry Pi", "Mechatronics", "Intel RealSense"],
    level: 80
  },
  {
    name: "Creative & Design",
    skills: ["Adobe Illustrator", "Premiere Pro", "ProCreate", "Canva", "Photography"],
    level: 85
  }
];

export const PROJECTS: Project[] = [
  {
    id: "creation-toolkit",
    title: "Creation Toolkit / Services",
    year: "2026",
    description: "A suite of intelligent, client-side AI tools: ATS Scanner, Background Remover, and more.",
    longDescription: "A comprehensive suite of browser-based utilities designed for creators and developers. Includes an AI Background Remover using SAM 2, an Image-to-Palette extractor, a secure client-side File Converter Hub, and an ATS Resume Scanner powered by Google Gemini 2.5 Flash.",
    tags: ["React", "AI", "Gemini", "SAM 2", "Client-Side"],
    icon: "web",
    link: "/services",
    images: [
      "https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    id: "vto-system",
    title: "Virtual Try-On System",
    year: "2025",
    description: "A real-time Unity-based virtual fitting room using pose estimation, depth sensing, and cloth simulation.",
    longDescription: "My Virtual Try-On (VTO) system is a real-time, Unity-based solution that allows users to see themselves wearing digital garments instantly — like a magic mirror. It uses an Intel RealSense D415 camera to capture both RGB and depth data, which is then processed through an ONNX-based pose estimation model running on Unity via Barracuda. The system maps the user's body joints to a rigged 3D avatar (Y-Bot) in real time, simulates cloth physics using Unity’s HDRP engine, and overlays the rendered garment directly onto the webcam feed. The result is a seamless, responsive virtual fitting experience — without any pre-recorded calibration or manual adjustments.",
    tags: ["Unity", "AR", "Computer Vision", "Intel RealSense", "ONNX"],
    icon: "ar",
    link: "#",
    images: [
      "/images/projects/vto/unnamed.png",
      "/images/projects/vto/unnamed (1).png",
      "/images/projects/vto/unnamed (2).png",
      "/images/projects/vto/unnamed (3).png"
    ]
  },
  {
    id: "ai-fashion",
    title: "AI Image & Video Generation",
    year: "2024",
    description: "High Fashion Streetwear Urban Couture and Avant-Garde AI-generated fashion concepts.",
    longDescription: "Exploration of AI in Haute Couture, blending High Fashion Streetwear with futuristic concepts like Space Age Fashion, Tokyo Techno-Chic, and Neon Fashion Future. This collection utilizes generative AI to create visual narratives ranging from Minimalist Luxury to Industrial Elegance and Avant-Garde Nature.",
    tags: ["Generative AI", "Midjourney", "Digital Fashion", "Concept Art"],
    icon: "ai",
    link: "#",
    images: [
      "/images/projects/ai-fashion/preview.png"
    ]
  },
  {
    id: "agv",
    title: "AGV (Autonomous Guided Vehicle)",
    year: "2023",
    description: "Autonomous Guided Vehicle capable of navigating using vision and sensors, built from scratch.",
    longDescription: "Developed an AGV capable of navigating using vision and sensors. The vehicle is built on a 4 omni-wheel chassis and controlled using an Arduino Mega paired with a Raspberry Pi 4. Upgraded to rely on the Intel RealSense D415 depth camera for obstacle detection. Version 1.0 focused on Line Tracking with IR sensors, while Version 2.0 integrates RealSense + Gyro for advanced navigation.",
    tags: ["Robotics", "Arduino", "Raspberry Pi", "Intel RealSense", "C++"],
    icon: "bot",
    link: "#",
    images: [
      "/images/projects/agv/unnamed.gif",
      "/images/projects/agv/unnamed.jpg",
      "/images/projects/agv/unnamed (1).jpg",
      "/images/projects/agv/unnamed.png"
    ]
  },
  {
    id: "robotic-arm",
    title: "Robotic Arm",
    year: "2023",
    description: "6 DOF, Web-Controlled, Fully 3D Printed Robotic Arm modeled in Fusion 360.",
    longDescription: "I designed and built a 6 Degrees-of-Freedom (DOF) robotic arm from scratch, combining mechanical engineering, electronics, and web-based control. The entire structure was modeled in Fusion 360 and 3D printed using PLA. It’s powered by Waveshare servo motors, an L298N motor driver, and controlled via a Raspberry Pi hosting a local web server.",
    tags: ["Robotics", "Fusion 360", "3D Printing", "Web Control"],
    icon: "bot",
    link: "#",
    images: [
      "/images/projects/robotic-arm/unnamed.gif",
      "/images/projects/robotic-arm/unnamed.jpg",
      "/images/projects/robotic-arm/unnamed (1).png",
      "/images/projects/robotic-arm/unnamed.png"
    ]
  },
  {
    id: "blender-design",
    title: "Blender & 3D Design",
    year: "2024",
    description: "Design, Render, and Simulate. Environments and fashion simulation.",
    longDescription: "Showcases work ranging from environment design to fashion simulation, including virtual showrooms and digital garments. A highlight is the Immersive Automotive Retail Experience: a futuristic Porsche showroom modeled in Blender with integrated VR interface.",
    tags: ["Blender", "3D Modeling", "VR", "Simulation"],
    icon: "design",
    link: "#",
    images: [
      "/images/projects/blender/unnamed.jpg",
      "/images/projects/blender/unnamed (1).jpg",
      "/images/projects/blender/unnamed (2).jpg",
      "/images/projects/blender/unnamed (3).jpg"
    ]
  }
];