module.exports = (uptimeStr) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Seid E-Commerce — API</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: "Inter", sans-serif;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0d1117;
        color: #e6edf3;
        overflow: hidden;
      }

      /* Animated gradient orbs */
      body::before,
      body::after {
        content: "";
        position: fixed;
        border-radius: 50%;
        filter: blur(120px);
        opacity: 0.35;
        animation: drift 8s ease-in-out infinite alternate;
      }
      body::before {
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, #6e40c9, #1a1aff);
        top: -150px;
        left: -150px;
      }
      body::after {
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, #00c6ff, #0072ff);
        bottom: -120px;
        right: -120px;
        animation-delay: 4s;
      }

      @keyframes drift {
        from {
          transform: translate(0, 0) scale(1);
        }
        to {
          transform: translate(40px, 30px) scale(1.08);
        }
      }

      .card {
        position: relative;
        z-index: 1;
        background: rgba(22, 27, 34, 0.75);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        padding: 56px 64px;
        max-width: 540px;
        width: 90%;
        text-align: center;
        box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(46, 160, 67, 0.15);
        border: 1px solid rgba(46, 160, 67, 0.4);
        color: #3fb950;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
        padding: 6px 16px;
        border-radius: 999px;
        margin-bottom: 28px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #3fb950;
        box-shadow: 0 0 8px #3fb950;
        animation: pulse 1.8s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(0.75);
        }
      }

      h1 {
        font-size: 2rem;
        font-weight: 700;
        background: linear-gradient(135deg, #e6edf3 30%, #8b949e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 12px;
        line-height: 1.2;
      }

      .subtitle {
        color: #8b949e;
        font-size: 0.95rem;
        margin-bottom: 40px;
        line-height: 1.6;
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 36px;
      }

      .stat {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 14px;
        padding: 18px 14px;
      }

      .stat-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6e7681;
        margin-bottom: 6px;
      }

      .stat-value {
        font-size: 1rem;
        font-weight: 600;
        color: #c9d1d9;
      }

      .divider {
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        margin-bottom: 28px;
      }

      .links {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        display: inline-block;
        padding: 10px 22px;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: linear-gradient(135deg, #6e40c9, #4078f2);
        color: #fff;
        box-shadow: 0 4px 14px rgba(110, 64, 201, 0.4);
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(110, 64, 201, 0.55);
      }

      .btn-ghost {
        background: rgba(255, 255, 255, 0.05);
        color: #8b949e;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .btn-ghost:hover {
        background: rgba(255, 255, 255, 0.09);
        color: #c9d1d9;
        transform: translateY(-2px);
      }

      .footer {
        margin-top: 28px;
        font-size: 12px;
        color: #484f58;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="badge"><span class="dot"></span> All Systems Operational</div>
      <h1>Seid E-Commerce API</h1>
      <p class="subtitle">
        The backend server is live and handling requests.<br />Use the endpoints
        below to get started.
      </p>

      <div class="grid">
        <div class="stat">
          <div class="stat-label">Environment</div>
          <div class="stat-value">${process.env.NODE_ENV || "development"}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Uptime</div>
          <div class="stat-value">${uptimeStr}</div>
        </div>
        <div class="stat">
          <div class="stat-label">API Version</div>
          <div class="stat-value">v1</div>
        </div>
        <div class="stat">
          <div class="stat-label">Timestamp</div>
          <div class="stat-value" style="font-size: 0.8rem">
            ${new Date().toISOString()}
          </div>
        </div>
      </div>

      <hr class="divider" />

      <div class="links">
        <a class="btn btn-primary" href="/api/v1/health">Health Check</a>
        <a class="btn btn-ghost" href="/api/v1/products">Products API</a>
      </div>

      <div class="footer">Powered by Express · Node ${process.version}</div>
    </div>
  </body>
</html>`;
