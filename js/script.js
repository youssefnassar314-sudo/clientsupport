function showSection(sectionId) {
    document.getElementById('mainMenu').style.display = 'none';
    
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(function(sec) {
        sec.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(function(sec) {
        sec.classList.remove('active');
    });
    
    document.getElementById('mainMenu').style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// LOGIC PARA SA ESTIMATOR
function computeBill() {
    const plan = parseInt(document.getElementById('planSelect').value);
    const dateInput = document.getElementById('installDate').value;
    
    // Check kung may nilagay na inputs
    if(!plan || !dateInput) {
        alert("Pakipili ang iyong Plan at ang eksaktong petsa kung kailan ka nakabitan.");
        return;
    }

    // Kunin ang araw, buwan, at taon mula sa input
    const installDate = new Date(dateInput);
    const day = installDate.getDate();
    const monthIndex = installDate.getMonth(); 
    const year = installDate.getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Kunin kung ilang araw meron sa buwan na kinabitan (ex. 30, 31, 28)
    let daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); 
    
    // BASE PRORATED COMPUTATION
    let proratedText = "";
    let min = 0;
    let max = 0;

    if(day === 1) {
        proratedText = "₱" + plan;
        min = plan;
        max = plan;
    } else {
        let daysUsed = daysInMonth - day + 1;
        let exactEst = (plan / 30) * daysUsed;
        
        min = Math.floor(exactEst / 50) * 50;
        max = min + 50;
        
        if (max > plan) max = plan;
        
        if (min >= plan) {
            proratedText = "₱" + plan;
        } else {
            proratedText = "₱" + min + " - ₱" + max;
        }
    }
    
    // COMPUTATION NG DATES AT AMOUNT HTML (1-15 vs 16-End of month)
    let genMonth, dueMonth, graceMonth;
    let amountHtml = "";
    
    if (day <= 15) {
        // Option A (1st to 15th) - Prorated lang ang unang bill
        genMonth = monthIndex;
        dueMonth = monthIndex;
        graceMonth = (monthIndex + 1) % 12;

        amountHtml = `
            <strong style='color: #475569; font-size: 14px;'>Estimated Unang Bill:</strong><br>
            <span style='font-size: 26px; font-weight: 700; color: #c2410c;'>${proratedText}</span><br>
            <span style='font-size:11px; color:#64748b; display: block; margin-top: 5px;'>*Ito ay prorated estimate lamang. Laging i-check ang final e-SOA sa email.</span>
        `;

    } else {
        // Option B (16th to End of month) - Prorated + Advance 1 Month
        genMonth = (monthIndex + 1) % 12;
        dueMonth = (monthIndex + 1) % 12;
        graceMonth = (monthIndex + 2) % 12;

        let totalMin = min + plan;
        let totalMax = max + plan;
        
        let totalText = "₱" + totalMin + " - ₱" + totalMax;
        if (min >= plan) totalText = "₱" + (plan + plan); // Edge case

        amountHtml = `
            <strong style='color: #475569; font-size: 14px;'>Estimated Unang e-SOA (Dalawang Buwan):</strong><br>
            <span style='font-size: 26px; font-weight: 700; color: #c2410c;'>${totalText}</span><br>
            
            <div style='font-size: 13px; color: #475569; margin-top: 10px; text-align: left; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1;'>
                <strong style='color: #1e3a8a;'>Breakdown ng Bill:</strong><br>
                <div style='display: flex; justify-content: space-between; margin-top: 4px;'>
                    <span>First Bill (Pro-rated):</span> <strong>${proratedText}</strong>
                </div>
                <div style='display: flex; justify-content: space-between; margin-top: 4px;'>
                    <span>Second Bill (Buong Buwan):</span> <strong>₱${plan}</strong>
                </div>
                <div style='display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;'>
                    <strong>Estimated Total:</strong> <strong style='color: #c2410c;'>${totalText}</strong>
                </div>
            </div>
            
            <span style='font-size:11px; color:#64748b; display: block; margin-top: 8px;'>
                *Dahil lagpas 15th ka nakabitan, ang unang e-SOA mo ay pinagsamang pro-rated at buong advance na buwan. Check ang final bill sa email.
            </span>
        `;
    }

    // Kunin ang exact na last day ng Due Date month
    let dueYear = year;
    if (dueMonth < monthIndex) dueYear++; // Kung nag-cross sa next year (Dec to Jan)
    let lastDayOfDueMonth = new Date(dueYear, dueMonth + 1, 0).getDate();

    // I-display ang resulta sa HTML
    const resultDiv = document.getElementById('calcResult');
    resultDiv.style.display = 'block';
    
    resultDiv.innerHTML = `
        ${amountHtml}
        <hr style="border: 0; border-top: 1px dashed #fdba74; margin: 15px 0;">
        <div style="text-align: left; font-size: 13px; color: #475569;">
            <p style="margin-bottom: 8px; color: #c2410c;"><strong>📅 Billing Schedule Mo:</strong></p>
            <ul class="custom-list" style="padding-left: 15px; margin-bottom: 0;">
                <li><strong>Bill Generation:</strong> ${monthNames[genMonth]} 15</li>
                <li><strong>Email ng E-SOA:</strong> ${monthNames[genMonth]} 17 hanggang 20</li>
                <li><strong>Due Date:</strong> ${monthNames[dueMonth]} ${lastDayOfDueMonth}</li>
                <li style="margin-top: 5px; list-style: none;"><strong>Grace Period:</strong></li>
                <ul style="padding-left: 20px; list-style-type: circle;">
                    <li>Online Payment: <strong>${monthNames[graceMonth]} 10</strong></li>
                    <li>Office Payment: <strong>${monthNames[graceMonth]} 14</strong></li>
                </ul>
            </ul>
        </div>
    `;
}

// AUTO-UPDATE NG CURRENT MONTHS SA HTML TEXT
document.addEventListener("DOMContentLoaded", function() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Kunin ang date ngayon real-time
    const today = new Date();
    const m0 = today.getMonth();            // Current month (ex. May)
    const m1 = (m0 + 1) % 12;               // Next month (ex. June)
    const m2 = (m0 + 2) % 12;               // Next next month (ex. July)
    
    const y0 = today.getFullYear();
    const y1 = (m1 < m0) ? y0 + 1 : y0;     // Kung nag-cross sa next year

    // Kunin kung ilang araw meron para makuha ang exact end of the month
    const endM0 = new Date(y0, m0 + 1, 0).getDate();
    const endM1 = new Date(y1, m1 + 1, 0).getDate();

    // I-inject ang mga text sa loob ng mga HTML placeholders
    document.querySelectorAll('.dyn-m0').forEach(el => el.innerText = months[m0]);
    document.querySelectorAll('.dyn-m1').forEach(el => el.innerText = months[m1]);
    document.querySelectorAll('.dyn-m2').forEach(el => el.innerText = months[m2]);
    
    // I-inject ang exact Due Dates
    document.querySelectorAll('.dyn-m0-end').forEach(el => el.innerText = months[m0] + " " + endM0);
    document.querySelectorAll('.dyn-m1-end').forEach(el => el.innerText = months[m1] + " " + endM1);
});

// LOGIC PARA SA PAYMENT CHANNELS
function showPaymentGuide() {
    // 1. Itago lahat ng payment cards muna
    document.getElementById('payment-skyline').style.display = 'none';
    document.getElementById('payment-bctv').style.display = 'none';
    document.getElementById('payment-kabayan').style.display = 'none';

    // 2. Kunin kung anong provider ang naka-link sa piniling location
    const provider = document.getElementById('locationSelect').value;

    // 3. Ipakita ang tamang card at mag-scroll ng konti pababa
    if (provider) {
        const selectedDiv = document.getElementById('payment-' + provider);
        selectedDiv.style.display = 'block';
        
        // Adds a smooth animation when showing
        selectedDiv.style.animation = 'none';
        selectedDiv.offsetHeight; // trigger reflow
        selectedDiv.style.animation = 'fadeInSlide 0.3s ease forwards';
    }
}

// LOGIC PARA SA COPY REPORT MESSAGE
function copyReport() {
    const name = document.getElementById('repName').value.trim();
    const accNum = document.getElementById('repAccNum').value.trim();
    const mobile = document.getElementById('repMobile').value.trim();
    const issue = document.getElementById('repIssue').value.trim();

    // Check kung walang laman yung form
    if(!name || !accNum || !issue) {
        alert("Paki-fill up kahit ang Name, Account Number, at Concern bago mag-copy.");
        return;
    }

    // Ito yung format na ma-cacopy sa clipboard
    const reportText = `Account Name: ${name}\nAccount Number: ${accNum}\nMobile Number: ${mobile}\nReport / Concern:\n${issue}`;

    // Code para mai-save sa clipboard ng phone/laptop
    navigator.clipboard.writeText(reportText).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerHTML;
        
        // Papalitan natin yung itsura ng button pagkatapos ma-copy
        btn.innerHTML = `<span class="material-symbols-rounded">check</span> Na-copy na! Pwede na i-paste.`;
        btn.style.background = "#16a34a"; // Green color
        
        // Ibalik sa normal after 3 seconds
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = "#3b82f6"; // Blue color
        }, 3000);
        
    }).catch(err => {
        alert("Hindi ma-copy ang text sa device mo. Paki-type na lang manually sa Messenger.");
    });
}

function showSection(sectionId) {
    document.getElementById('mainMenu').style.display = 'none';
    
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(function(sec) {
        sec.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(function(sec) {
        sec.classList.remove('active');
    });
    
    document.getElementById('mainMenu').style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// LOGIC PARA SA ESTIMATOR
function computeBill() {
    const plan = parseInt(document.getElementById('planSelect').value);
    const dateInput = document.getElementById('installDate').value;
    
    // Check kung may nilagay na inputs
    if(!plan || !dateInput) {
        alert("Pakipili ang iyong Plan at ang eksaktong petsa kung kailan ka nakabitan.");
        return;
    }

    // Kunin ang araw, buwan, at taon mula sa input
    const installDate = new Date(dateInput);
    const day = installDate.getDate();
    const monthIndex = installDate.getMonth(); 
    const year = installDate.getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Kunin kung ilang araw meron sa buwan na kinabitan (ex. 30, 31, 28)
    let daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); 
    
    // BASE PRORATED COMPUTATION
    let proratedText = "";
    let min = 0;
    let max = 0;

    if(day === 1) {
        proratedText = "₱" + plan;
        min = plan;
        max = plan;
    } else {
        let daysUsed = daysInMonth - day + 1;
        let exactEst = (plan / 30) * daysUsed;
        
        min = Math.floor(exactEst / 50) * 50;
        max = min + 50;
        
        if (max > plan) max = plan;
        
        if (min >= plan) {
            proratedText = "₱" + plan;
        } else {
            proratedText = "₱" + min + " - ₱" + max;
        }
    }
    
    // COMPUTATION NG DATES AT AMOUNT HTML (1-15 vs 16-End of month)
    let genMonth, dueMonth, graceMonth;
    let amountHtml = "";
    
    if (day <= 15) {
        // Option A (1st to 15th) - Prorated lang ang unang bill
        genMonth = monthIndex;
        dueMonth = monthIndex;
        graceMonth = (monthIndex + 1) % 12;

        amountHtml = `
            <strong style='color: #475569; font-size: 14px;'>Estimated Unang Bill:</strong><br>
            <span style='font-size: 26px; font-weight: 700; color: #c2410c;'>${proratedText}</span><br>
            <span style='font-size:11px; color:#64748b; display: block; margin-top: 5px;'>*Ito ay prorated estimate lamang. Laging i-check ang final e-SOA sa email.</span>
        `;

    } else {
        // Option B (16th to End of month) - Prorated + Advance 1 Month
        genMonth = (monthIndex + 1) % 12;
        dueMonth = (monthIndex + 1) % 12;
        graceMonth = (monthIndex + 2) % 12;

        let totalMin = min + plan;
        let totalMax = max + plan;
        
        let totalText = "₱" + totalMin + " - ₱" + totalMax;
        if (min >= plan) totalText = "₱" + (plan + plan); // Edge case

        amountHtml = `
            <strong style='color: #475569; font-size: 14px;'>Estimated Unang e-SOA (Dalawang Buwan):</strong><br>
            <span style='font-size: 26px; font-weight: 700; color: #c2410c;'>${totalText}</span><br>
            
            <div style='font-size: 13px; color: #475569; margin-top: 10px; text-align: left; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1;'>
                <strong style='color: #1e3a8a;'>Breakdown ng Bill:</strong><br>
                <div style='display: flex; justify-content: space-between; margin-top: 4px;'>
                    <span>First Bill (Pro-rated):</span> <strong>${proratedText}</strong>
                </div>
                <div style='display: flex; justify-content: space-between; margin-top: 4px;'>
                    <span>Second Bill (Buong Buwan):</span> <strong>₱${plan}</strong>
                </div>
                <div style='display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;'>
                    <strong>Estimated Total:</strong> <strong style='color: #c2410c;'>${totalText}</strong>
                </div>
            </div>
            
            <span style='font-size:11px; color:#64748b; display: block; margin-top: 8px;'>
                *Dahil lagpas 15th ka nakabitan, ang unang e-SOA mo ay pinagsamang pro-rated at buong advance na buwan. Check ang final bill sa email.
            </span>
        `;
    }

    // Kunin ang exact na last day ng Due Date month
    let dueYear = year;
    if (dueMonth < monthIndex) dueYear++; // Kung nag-cross sa next year (Dec to Jan)
    let lastDayOfDueMonth = new Date(dueYear, dueMonth + 1, 0).getDate();

    // I-display ang resulta sa HTML
    const resultDiv = document.getElementById('calcResult');
    resultDiv.style.display = 'block';
    
    resultDiv.innerHTML = `
        ${amountHtml}
        <hr style="border: 0; border-top: 1px dashed #fdba74; margin: 15px 0;">
        <div style="text-align: left; font-size: 13px; color: #475569;">
            <p style="margin-bottom: 8px; color: #c2410c;"><strong>📅 Billing Schedule Mo:</strong></p>
            <ul class="custom-list" style="padding-left: 15px; margin-bottom: 0;">
                <li><strong>Bill Generation:</strong> ${monthNames[genMonth]} 15</li>
                <li><strong>Email ng E-SOA:</strong> ${monthNames[genMonth]} 17 hanggang 20</li>
                <li><strong>Due Date:</strong> ${monthNames[dueMonth]} ${lastDayOfDueMonth}</li>
                <li style="margin-top: 5px; list-style: none;"><strong>Grace Period:</strong></li>
                <ul style="padding-left: 20px; list-style-type: circle;">
                    <li>Online Payment: <strong>${monthNames[graceMonth]} 10</strong></li>
                    <li>Office Payment: <strong>${monthNames[graceMonth]} 14</strong></li>
                </ul>
            </ul>
        </div>
    `;
}

// AUTO-UPDATE NG CURRENT MONTHS SA HTML TEXT
document.addEventListener("DOMContentLoaded", function() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Kunin ang date ngayon real-time
    const today = new Date();
    const m0 = today.getMonth();            // Current month (ex. May)
    const m1 = (m0 + 1) % 12;               // Next month (ex. June)
    const m2 = (m0 + 2) % 12;               // Next next month (ex. July)
    
    const y0 = today.getFullYear();
    const y1 = (m1 < m0) ? y0 + 1 : y0;     // Kung nag-cross sa next year

    // Kunin kung ilang araw meron para makuha ang exact end of the month
    const endM0 = new Date(y0, m0 + 1, 0).getDate();
    const endM1 = new Date(y1, m1 + 1, 0).getDate();

    // I-inject ang mga text sa loob ng mga HTML placeholders
    document.querySelectorAll('.dyn-m0').forEach(el => el.innerText = months[m0]);
    document.querySelectorAll('.dyn-m1').forEach(el => el.innerText = months[m1]);
    document.querySelectorAll('.dyn-m2').forEach(el => el.innerText = months[m2]);
    
    // I-inject ang exact Due Dates
    document.querySelectorAll('.dyn-m0-end').forEach(el => el.innerText = months[m0] + " " + endM0);
    document.querySelectorAll('.dyn-m1-end').forEach(el => el.innerText = months[m1] + " " + endM1);
});

// LOGIC PARA SA PAYMENT CHANNELS
function showPaymentGuide() {
    // 1. Itago lahat ng payment cards muna
    document.getElementById('payment-skyline').style.display = 'none';
    document.getElementById('payment-bctv').style.display = 'none';
    document.getElementById('payment-kabayan').style.display = 'none';

    // 2. Kunin kung anong provider ang naka-link sa piniling location
    const provider = document.getElementById('locationSelect').value;

    // 3. Ipakita ang tamang card at mag-scroll ng konti pababa
    if (provider) {
        const selectedDiv = document.getElementById('payment-' + provider);
        selectedDiv.style.display = 'block';
        
        // Adds a smooth animation when showing
        selectedDiv.style.animation = 'none';
        selectedDiv.offsetHeight; // trigger reflow
        selectedDiv.style.animation = 'fadeInSlide 0.3s ease forwards';
    }
}

// LOGIC PARA SA COPY REPORT MESSAGE
function copyReport() {
    const name = document.getElementById('repName').value.trim();
    const accNum = document.getElementById('repAccNum').value.trim();
    const mobile = document.getElementById('repMobile').value.trim();
    const issue = document.getElementById('repIssue').value.trim();

    // Check kung walang laman yung form
    if(!name || !accNum || !issue) {
        alert("Paki-fill up kahit ang Name, Account Number, at Concern bago mag-copy.");
        return;
    }

    // Ito yung format na ma-cacopy sa clipboard
    const reportText = `Account Name: ${name}\nAccount Number: ${accNum}\nMobile Number: ${mobile}\nReport / Concern:\n${issue}`;

    // Code para mai-save sa clipboard ng phone/laptop
    navigator.clipboard.writeText(reportText).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerHTML;
        
        // Papalitan natin yung itsura ng button pagkatapos ma-copy
        btn.innerHTML = `<span class="material-symbols-rounded">check</span> Na-copy na! Pwede na i-paste.`;
        btn.style.background = "#16a34a"; // Green color
        
        // Ibalik sa normal after 3 seconds
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = "#3b82f6"; // Blue color
        }, 3000);
        
    }).catch(err => {
        alert("Hindi ma-copy ang text sa device mo. Paki-type na lang manually sa Messenger.");
    });
}
