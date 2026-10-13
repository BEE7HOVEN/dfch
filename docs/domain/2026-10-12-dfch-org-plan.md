# dfch.org 도메인 연결

Cloudflare에서 산 dfch.org를 Vercel 프로젝트 dfch에 붙인다. 대표 주소는 dfch.org, www.dfch.org는 대표 주소로 넘긴다.

- [x] Vercel 프로젝트에 dfch.org, www.dfch.org 추가 — 확인: `vercel domains inspect dfch.org`
- [x] Cloudflare DNS에 Vercel이 요구하는 레코드 추가(프록시 끔) — 확인: `dig +short dfch.org A @gina.ns.cloudflare.com | grep -qE '^(76\.76\.21\.|216\.198\.)' && dig +short www.dfch.org CNAME @gina.ns.cloudflare.com | grep -q vercel`
- [x] Vercel에서 도메인 확인·인증서 발급 완료 — 확인: `curl -sfI --resolve dfch.org:443:76.76.21.21 https://dfch.org | grep -q '^HTTP/2 200'`
- [x] www.dfch.org가 dfch.org로 넘어감 — 확인: `curl -sI --resolve www.dfch.org:443:216.198.79.1 https://www.dfch.org | grep -qi '^location: https://dfch.org/'`
- [x] R2 CORS 허용 주소에 https://dfch.org, https://www.dfch.org 추가 — 확인: `cd /tmp && HOME=/Users/bee7/.cloudflare-personal WRANGLER_SEND_METRICS=false npx -y wrangler@latest r2 bucket cors list dfch-media 2>/dev/null | grep -q 'https://dfch.org, https://www.dfch.org'`
- [x] Vercel 환경 변수 SITE_URL=https://dfch.org 설정 후 다시 배포 — 확인: `curl -s --resolve dfch.org:443:76.76.21.21 https://dfch.org | grep -q 'og:image" content="https://dfch.org/'`
