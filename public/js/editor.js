document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('content');
    const previewContent = document.getElementById('preview-content');
    const titleInput = document.getElementById('title');
    const tagsInput = document.getElementById('tags');

    // 텍스트 영역의 변경 내용을 미리보기로 업데이트
    function updatePreview() {
        previewContent.innerHTML = textarea.value
            .replace(/(?:\r\n|\r|\n)/g, '<br>') // 줄 바꿈을 <br>로 대체
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // 굵은 글씨
            .replace(/\*(.*?)\*/g, '<i>$1</i>') // 기울임 글씨
            .replace(/__(.*?)__/g, '<u>$1</u>') // 밑줄
            .replace(/## (.*?)$/gm, '<h2>$1</h2>') // 제목
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>') // 링크
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">') // 이미지
            .replace(/^---$/gm, '<hr>') // 수평선
            .replace(/==([^=]+)==/g, '<span class="highlight">$1</span>'); // 강조
    }

    // 커서 위치에 텍스트 삽입
    function insertTextAtCursor(text) {
        const cursorPosition = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPosition);
        const textAfter = textarea.value.substring(cursorPosition);
        textarea.value = textBefore + text + textAfter;
        textarea.selectionStart = cursorPosition + text.length;
        textarea.selectionEnd = cursorPosition + text.length;
        textarea.focus();
        updatePreview();
    }

    // 텍스트 포맷 버튼 이벤트 핸들러
    document.getElementById('bold').addEventListener('click', () => {
        insertTextAtCursor('**텍스트**');
    });

    document.getElementById('italic').addEventListener('click', () => {
        insertTextAtCursor('*텍스트*');
    });

    document.getElementById('underline').addEventListener('click', () => {
        insertTextAtCursor('__텍스트__');
    });

    document.getElementById('heading').addEventListener('click', () => {
        insertTextAtCursor('\n## ');
    });

    document.getElementById('highlight').addEventListener('click', () => {
        insertTextAtCursor('==텍스트==');
    });

    // 링크 삽입 버튼 클릭 시 팝업 표시
    document.getElementById('link').addEventListener('click', async () => {
        const { url, text } = await showPrompt('link');
        if (url) {
            insertTextAtCursor(`[${text || 'Link'}](${url})`);
        }
    });

    // 이미지 삽입 버튼 클릭 시 팝업 표시
    document.getElementById('image').addEventListener('click', async () => {
        const { url, alt } = await showPrompt('image');
        if (url) {
            insertTextAtCursor(`![${alt || 'Image'}](${url})`);
        }
    });

    // 수평선 버튼 클릭 시 텍스트 삽입
    document.getElementById('horizontal-line').addEventListener('click', () => {
        insertTextAtCursor('\n---\n');
    });

    // 임시 저장 버튼 클릭 시 알림 표시
    document.getElementById('save').addEventListener('click', () => {
        alert('Draft saved!');
    });

    // 발행하기 버튼 클릭 시 폼 제출
    document.getElementById('publish').addEventListener('click', () => {
        document.querySelector('form').submit();
    });

    // 텍스트 영역의 입력 이벤트를 처리하여 미리보기 업데이트
    textarea.addEventListener('input', updatePreview);

    // URL과 텍스트를 입력받는 팝업 표시 및 값 반환
    async function showPrompt(type) {
        return new Promise((resolve) => {
            const popup = type === 'link' ? document.getElementById('link-popup') : document.getElementById('image-popup');
            const form = type === 'link' ? document.getElementById('link-form') : document.getElementById('image-form');
            const inputUrl = form.querySelector(`#${type}-url`);
            const inputText = form.querySelector(`#${type}-text`);
            const closeButton = document.querySelector("popup-close");

            popup.classList.remove('hidden');
            
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                resolve({ url: inputUrl.value, text: inputText ? inputText.value : '' });
                popup.classList.add('hidden');
            }, { once: true });

            closeButton.addEventListener('click', (event) => {
                event.preventDefault();
                popup.classList.add('hidden');
            }, { once: true });
        });
    }
});
