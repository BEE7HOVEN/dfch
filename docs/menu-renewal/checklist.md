# 메뉴 개편 체크리스트

브랜치: `feat/menu-renewal`

## 1단계: 메뉴 구조
- [x] 메뉴 구조를 `src/lib/nav.ts` 한 곳으로 모으기
- [x] 헤더 드롭다운 (PC 호버·키보드, 모바일 묶음)
- [x] 푸터 메뉴를 상위 메뉴별로 묶기
- [x] 교회 소개 `/about` (메인 소개 글 컴포넌트 재사용)
- [x] 예배 안내 `/service` 예배시간만 남기기
- [x] 오시는 길 `/location` 분리
- [x] 설교말씀 탭 (예배실황 / 주일설교 / 수요설교, 제목 기준 분류)
- [x] 매일의 묵상 `/meditation` 게시판
- [x] 교회소식 준비 중 페이지 (주보 / 갤러리 / 공지사항)
- [x] `npm run lint`, `npm run build` 통과
- [x] PC·모바일 화면 확인 (DB를 쓰는 화면 제외)

## 2단계: 묵상 녹음 업로드 (R2)
- [x] `src/lib/r2.ts` 업로드·재생 서명 주소, 파일 삭제
- [x] `posts.audio_key` 읽기·쓰기 코드
- [x] 관리자: 게시판별 새 글 버튼, 묵상 폼(본문·녹음·메모), 업로드 진행률
- [x] 녹음 교체·글 삭제 시 R2 파일 삭제
- [x] 묵상 본문 화면에 재생 버튼
- [x] `db/migrations/001_posts_audio_key.sql` 작성 (아직 실행 안 함)
- [x] R2 버킷 `dfch-media` 생성(개인 계정), CORS 설정 (`r2-cors.json`)
- [x] lint·타입체크·빌드 통과, 폼 화면·오류 안내·모바일 폭 확인
- [x] R2 접근 키 발급(토큰 `dfch-media`, Object Read & Write, 버킷 한정) → `.env.local`에 `R2_*` 4개 입력
- [x] R2 접속 확인: CORS 사전요청 204, 서명 주소 업로드 200·읽기 200·삭제 204, 화면의 녹음 칸에서 업로드 완료(Content-Type `audio/mp4`)
- [x] Vercel 프로젝트에도 `R2_*` 4개 등록 (Production·Preview, 로컬 값과 일치 확인)
- [x] Neon `dfch` 프로젝트에 `dev` 브랜치 생성(자동 삭제 안 함) → `.env.local`의 `DATABASE_URL`을 dev로
- [x] `posts.category` CHECK 제약 없음 확인 → dev에 `audio_key` 칸 추가 (기존 목회편지 3편 유지)
- [x] dev에서 녹음 업로드 → 저장 → 목록 → 재생(실제 클릭 재생) → 교체(이전 파일 삭제) → 글 삭제(파일 삭제) 확인
- [x] 목회편지 수정 저장이 그대로 되는지 확인 (본문 1000자 유지)
- [x] WAV → MP3(모노 64kbps) 브라우저 변환 후 업로드, m4a는 그대로 업로드 확인
- [x] 운영(`production`) DB에 마이그레이션 적용 (2026-10-03, Neon SQL 편집기, `audio_key` 칸 확인)
- [x] 커밋·배포 (2026-10-03, 미리보기 확인 후 `main` 반영, dfch.vercel.app 메뉴 페이지 11개 200)
- [ ] 운영 사이트에서 실제 녹음 올리기·재생 확인 (운영 관리자 비밀번호로 사용자가 확인)
