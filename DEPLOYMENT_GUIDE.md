# Deployment Guide for shilpanshu.site

Since your previous website was built on **Google Sites**, it was hosted directly by Google's site builder. 

**Important**: You **cannot** host this new custom React/Vite application on Google Sites. Google Sites only allows its own drag-and-drop templates.

To use your domain (`shilpanshu.site`) with this new code, you need to:
1.  **Host** the code on a modern platform (We recommend **Vercel** or **Netlify** — both are free and optimized for this tech stack).
2.  **Point** your domain to the new host.

---

## Option 1: Vercel (Recommended)
Vercel is the industry standard for React apps.

### Step 1: Create a GitHub Repository (Best Practice)
1.  Go to [GitHub.com](https://github.com) and create a new repository called `shilpanshu-portfolio`.
2.  Open your terminal in the project folder and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/Shilpanshu/shilpanshu-portfolio.git
    git push -u origin main
    ```

### Step 2: Deploy on Vercel
1.  Go to [vercel.com](https://vercel.com) and sign up (you can log in with GitHub).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `shilpanshu-portfolio` repository.
4.  Vercel will detect it's a Vite project. **Keep all default settings**.
5.  Click **Deploy**.
6.  Wait ~1 minute. Your site will be live at `something.vercel.app`.

### Step 3: Connect Your Domain
1.  In your Vercel Project Dashboard, go to **Settings** -> **Domains**.
2.  Enter `shilpanshu.site` and click **Add**.
3.  Vercel will give you immediate instructions on what to change in your Domain Registrar (where you bought the domain, e.g., Google Domains, GoDaddy, Namecheap).
    *   **A Record**: `76.76.21.21`
    *   **CNAME**: `cname.vercel-dns.com`
4.  Log in to your Domain Registrar, find "DNS Settings", and add/update these records.
5.  Wait for propagation (usually minutes, sometimes up to 24h).

---

## Option 2: Netlify Drop (No Git Required)
If you don't want to use GitHub, you can just drag and drop your files.

1.  **Build the project locally** (You already did this):
    ```bash
    npm run build
    ```
    *This creates a `dist` folder in your project directory.*

2.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3.  Drag and drop the **`dist`** folder (inside `shilpanshu_portfolio`) onto the page.
4.  Your site is now essentially online.
5.  Click **"Domain Settings"** -> **"Add custom domain"**.
6.  Enter `shilpanshu.site`.
7.  Follow the instructions to update your DNS records (similar to Vercel above).

---

## Summary
| Feature | Google Sites | New React App (Vercel/Netlify) |
| :--- | :--- | :--- |
| **Editing** | Drag & Drop UI | Coding (VS Code) |
| **Hosting** | Google | Vercel / Netlify |
| **Flexibility** | Low | Unlimited (Animations, Custom Logic) |
| **Domain** | Connects to Sites | Connects to Vercel/Netlify DNS |

Once you update the DNS records, `shilpanshu.site` will stop showing the old Google Site and start showing this new Portfolio.

## Troubleshooting: Git Authentication Error
If you see **"Password authentication is not supported"** when pushing:
1.  Go to GitHub.com -> Click your profile photo -> **Settings**.
2.  On the left, scroll down to **Developer settings** -> **Personal access tokens** -> **Tokens (classic)**.
3.  Click **Generate new token (classic)**.
4.  Give it a name (e.g., "Portfolio"), set Expiration to "No expiration", and check the **repo** box.
5.  Click **Generate token**.
6.  **Copy the long code** starting with `ghp_`.
7.  In your terminal, run `git push -u origin main` again.
8.  Username: `Shilpanshu`
9.  Password: **Paste the token you just copied** (It won't show on screen, just paste and hit Enter).
