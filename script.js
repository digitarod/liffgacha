document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const treasureBox = document.getElementById('treasureBox');
    const spinBtn = document.getElementById('spinBtn');
    const serialInput = document.getElementById('serialCode');
    const flashOverlay = document.getElementById('flashOverlay');
    const resultModal = document.getElementById('resultModal');
    const resultContent = document.getElementById('resultContent');
    const closeBtn = document.getElementById('closeBtn');

    // State
    const ASSETS = {
        boxClosed: 'assets/box_closed.png',
        boxOpen: 'assets/box_open.png',
        winEffect: 'assets/win_effect.png'
    };

    // Replace this with the deployed Web App URL from Google Apps Script
    const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbz92q3NJsQ4_0Pdv-6kb5FJmoUUITZt-PeNKmUQyQ42ArOH9_EGqMFLiqvvx05-q-_pxw/exec'; 
    
    // For demo purposes, we will mock the backend response
    const USE_MOCK_BACKEND = false; 

    spinBtn.addEventListener('click', async () => {
        const code = serialInput.value.trim();
        if (!code) {
            alert('シリアルコードを入力してください');
            return;
        }

        // Lock UI
        spinBtn.disabled = true;
        serialInput.disabled = true;

        // Start Animation (Shake)
        treasureBox.classList.add('shaking');

        try {
            // Call Backend
            let result;
            if (USE_MOCK_BACKEND) {
                result = await mockBackend(code);
            } else {
                // Real implementation
                // const response = await fetch(`${GAS_API_URL}?code=${code}`);
                // result = await response.json();
            }

            // Artificial delay for suspense (e.g. 2 seconds)
            await new Promise(r => setTimeout(r, 2000));

            // Stop Shake
            treasureBox.classList.remove('shaking');

            // Flash Effect
            flashOverlay.classList.add('flashing');
            
            // Switch to Open Box immediately after flash starts
            setTimeout(() => {
                treasureBox.src = ASSETS.boxOpen;
            }, 250); // halfway through flash fade in

            // Show Result after flash peaks
            setTimeout(() => {
                showResult(result);
                flashOverlay.classList.remove('flashing');
            }, 600);

        } catch (error) {
            console.error(error);
            alert('エラーが発生しました: ' + error.message);
            resetUI();
        }
    });

    closeBtn.addEventListener('click', () => {
        resetUI();
    });

    function showResult(data) {
        resultContent.innerHTML = '';
        
        if (data.status === 'win') {
            // SSR Result
            const img = document.createElement('img');
            img.src = ASSETS.winEffect;
            img.className = 'result-image';
            resultContent.appendChild(img);
            
            const text = document.createElement('div');
            text.className = 'result-text';
            text.textContent = 'SSR 獲得！';
            resultContent.appendChild(text);

            const details = document.createElement('p');
            details.textContent = data.prizeName || '高級シャンパン';
            details.style.color = '#fff';
            details.style.marginTop = '10px';
            resultContent.appendChild(details);

        } else {
            // Point Result (Lose)
            const pts = data.pointsAdded || 1;
            const current = data.currentPoints || 10;
            const target = data.targetPoints || 50;
            const percent = Math.min((current / target) * 100, 100);

            const title = document.createElement('div');
            title.className = 'result-text';
            title.textContent = `${pts}pt GET!`;
            resultContent.appendChild(title);

            const gaugeContainer = document.createElement('div');
            gaugeContainer.className = 'points-gauge-container';
            const fill = document.createElement('div');
            fill.className = 'points-gauge-fill';
            fill.style.width = '0%'; // Animate later
            gaugeContainer.appendChild(fill);
            resultContent.appendChild(gaugeContainer);

            const sub = document.createElement('p');
            sub.className = 'points-text';
            sub.textContent = `スタバチケットまであと ${target - current}pt`;
            resultContent.appendChild(sub);

            // Animate gauge
            setTimeout(() => {
                fill.style.width = `${percent}%`;
            }, 100);
        }

        resultModal.classList.remove('hidden');
        closeBtn.classList.remove('hidden');
    }

    function resetUI() {
        // Reset Box
        treasureBox.src = ASSETS.boxClosed;
        
        // Hide Modal
        resultModal.classList.add('hidden');
        
        // Enable Controls
        spinBtn.disabled = false;
        serialInput.disabled = false;
        serialInput.value = '';
    }

    // Mock Backend for Logic Verification
    async function mockBackend(code) {
        // Simulate network delay
        // Check "Mock" logic
        if (code === 'SSR') {
            return {
                status: 'win',
                prizeName: 'アルマンド・ゴールド'
            };
        } else if (code === 'ERROR') {
            throw new Error('無効なコードです');
        } else {
            return {
                status: 'lose',
                pointsAdded: 1,
                currentPoints: Math.floor(Math.random() * 40),
                targetPoints: 50
            };
        }
    }
});
