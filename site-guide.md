# juli-ette.com 사이트 운영 가이드

---

## 1. 블로그 포스트 올리기

### 글 쓰기 (배포 없음)
1. [juli-ette.com/admin](https://juli-ette.com/admin) 접속 → 로그인
2. **Contents → Blog → + Blog post**
3. 필드 작성:
   - **Post ID**: 영문 소문자 + 하이픈 (예: `pink-cafe`, `my-bookshelf`)
   - **Photo**: 이미지 업로드
   - **Background / Text color**: 색상 선택
   - **Title**: 포스트 제목 (영문 대문자 권장)
   - **Date**: 날짜 (예: `2025-04-19`)
   - **Text**: 본문
4. **Save** → 배포 없이 저장됨 (Workflow → Drafts에 쌓임)

### 퍼블리시 (배포 1회)
1. 상단 **Workflow** 탭 클릭
2. Draft 카드를 **Ready** 컬럼으로 드래그
3. Ready 카드 클릭 → **Publish** 버튼 클릭
4. 1~3분 후 사이트에 반영됨

> 💡 **여러 글을 배포 1번에 올리고 싶을 때**: 모두 Ready로 옮긴 뒤 터미널에서 아래 명령어 한 번 실행

```
cd ~/Downloads/site-build && git fetch && git merge $(git branch -r | grep 'origin/cms/' | sed 's/origin\///' | tr '\n' ' ') --no-edit && git push origin HEAD:main
```

---

## 2. About 페이지 수정하기

1. **Contents → About → About Page**
2. 이름, 역할, 링크, 학력, 수상경력 등 수정
3. **Save** → 자동 배포

---

## 3. 프로젝트 수정하기

1. **Contents → Projects** → 수정할 프로젝트 클릭
2. 내용 수정 후 **Save** → 자동 배포

> ⚠️ 새 프로젝트 커버 이미지는 Behance 링크 대신 반드시 **직접 업로드** 할 것

---

## 4. 이미지가 깨질 때

터미널에서:

```
cd ~/Downloads/site-build && npm run build && git add -A && git commit -m "Fix images" && git push origin HEAD:main
```

---

## 5. Netlify 크레딧 아끼는 법

- 블로그 글 여러 개 → 다 쓰고 한꺼번에 Publish
- 위 터미널 명령어로 배포 1번으로 묶기
- 무료 플랜: 월 300 크레딧 (배포 1회 = 약 15~30 크레딧)
- 매월 15일 크레딧 충전
- Personal 플랜 ($9/월): 1,000 크레딧 — 업그레이드 후 바로 다운그레이드 신청 가능

---

## 6. 로그인이 안 될 때

[app.netlify.com](https://app.netlify.com) → Studio Juliette → Identity → 이메일로 초대 재발송

---

## 7. 긴급 문제 발생 시

- 사이트 안 열릴 때: [app.netlify.com](https://app.netlify.com) → Deploys → 이전 버전으로 롤백
- 이미지 깨질 때: 섹션 4 참고
- 그 외: Claude 새 대화에서 이 가이드 링크 공유하면 맥락 파악 가능

---

## 8. 한꺼번에 배포 명령어 (복사용)

```
cd ~/Downloads/site-build && git fetch && git merge $(git branch -r | grep 'origin/cms/' | sed 's/origin\///' | tr '\n' ' ') --no-edit && git push origin HEAD:main
```
