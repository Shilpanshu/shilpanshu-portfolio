export interface AISection {
    order: number;
    heading: string;
    description: string;
    media: {
        type: 'video';
        url: string;
    }[];
}

export const AI_CONTENT: AISection[] = [
    {
        "order": 1,
        "heading": "Renaissance Fashion Reimagined",
        "description": "Historical grandeur meets modern digital art.",
        "media": [
            { "type": "video", "url": "/videos/ai-fashion/20250325_1937_Renaissance Fashion Reimagined_simple_compose_01jq6t2dgketa91drabnr96c1y.mp4" },
            { "type": "video", "url": "/videos/ai-fashion/20250325_1937_Renaissance Fashion Reimagined_simple_compose_01jq6t2dgqe57tpkkjpk4w8bxc.mp4" }
        ]
    },
    {
        "order": 2,
        "heading": "Neon Fashion Editorial",
        "description": "Cyberpunk aesthetics in high fashion.",
        "media": [
            { "type": "video", "url": "/videos/ai-fashion/20250325_1938_Neon Fashion Editorial_simple_compose_01jq6t41dzegb8y3gy5874cnkz.mp4" },
            { "type": "video", "url": "/videos/ai-fashion/20250325_1938_Neon Fashion Editorial_simple_compose_01jq6t41e3far94n96dfsq1fx9.mp4" }
        ]
    },
    {
        "order": 3,
        "heading": "Ethereal Underwater Elegance",
        "description": "Fluid motion and aquatic couture.",
        "media": [
            { "type": "video", "url": "/videos/ai-fashion/20250325_2028_Ethereal Underwater Elegance_simple_compose_01jq6x00kbf1db75555gtptze9.mp4" },
            { "type": "video", "url": "/videos/ai-fashion/20250325_2028_Ethereal Underwater Elegance_simple_compose_01jq6x00kde7pb8v7bwjnkkgwe.mp4" }
        ]
    },
    {
        "order": 4,
        "heading": "Timeless Androgynous Elegance",
        "description": "Blurring lines with sophisticated style.",
        "media": [
            { "type": "video", "url": "/videos/ai-fashion/20250325_2139_Timeless Androgynous Elegance_simple_compose_01jq712cmqezpbwk1m83cdfvs8.mp4" },
            { "type": "video", "url": "/videos/ai-fashion/20250325_2139_Timeless Androgynous Elegance_simple_compose_01jq712cmvfhfvarcd0w09ykep.mp4" }
        ]
    }
];
