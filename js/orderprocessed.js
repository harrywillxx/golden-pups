// Configuration - Replace with your actual Airtable details
const AIRTABLE_CONFIG = {
    apiKey: 'patYOUR_PERSONAL_ACCESS_TOKEN', // You'll need to get this from https://airtable.com/account
    baseId: 'appZOoVECaRq3tHZT', // Your base ID
    tableName: 'tbl7KY7hBRK9kNVX2' // Your table ID
};

// Function to get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to show loading state
function showLoading() {
    const elements = ['orderId', 'orderDate', 'puppyName', 'puppyPrice', 'customerEmail', 'pickupDate', 'petBreed', 'petTraits', 'petWeight', 'petMicrochip'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<span style="color: #DAA520;">Loading...</span>';
        }
    });
}

// Function to set default/fallback data
function setDefaultData() {
    const today = new Date();
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 14);

    document.getElementById('orderDate').textContent = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('pickupDate').textContent = pickupDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to fetch order data from Airtable
async function fetchOrderData(orderId) {
    try {
        showLoading();
        
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        populateOrderData(data);
        
    } catch (error) {
        console.error('Error fetching order data:', error);
        showErrorMessage();
        setDefaultData(); // Fallback to default data
    }
}

// Function to populate the page with order data
function populateOrderData(data) {
    const fields = data.fields;
    const recordId = data.id;
    
    // Parse dates
    const orderDate = fields['Order Date'] ? new Date(fields['Order Date']) : new Date();
    const pickupDate = fields['Pickup Date'] ? new Date(fields['Pickup Date']) : (() => {
        const date = new Date();
        date.setDate(date.getDate() + 14);
        return date;
    })();

    // Get puppy name and parse price from the combined field
    // Get puppy name and parse price from the combined field
    const puppyName = fields['puppy'] || 'Fletcher Brown Male Teacup';
    const petNameAndPrice = fields['pet-name-and-price'] || '$2,300';
    const petPrice = priceMatch ? priceMatch[0] : '$2,300';

    // Update DOM elements
    document.getElementById('orderId').textContent = `#PP-${recordId.slice(-6)}`;
    document.getElementById('orderDate').textContent = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('puppyName').textContent = puppyName;
    document.getElementById('puppyPrice').textContent = petPrice;
    document.getElementById('customerEmail').textContent = fields['client-email'] || 'customer@example.com';
    document.getElementById('pickupDate').textContent = pickupDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update pet details (these might need to be added to your Airtable if not present)
    document.getElementById('petBreed').textContent = fields['Breed'] || 'Teacup-Toy Poodle';
    document.getElementById('petTraits').textContent = fields['Traits'] || 'Affectionate, Playful, Friendly, Faithful';
    document.getElementById('petWeight').textContent = fields['Weight'] || '5-10lbs';
    document.getElementById('petMicrochip').textContent = fields['Microchip'] || '91918';
}

// Function to show error message
function showErrorMessage() {
    const successCard = document.querySelector('.success-card');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #fee2e2;
        border: 2px solid #fca5a5;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        text-align: center;
        color: #dc2626;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ Unable to load order details</strong><br>
        <small>Displaying default information. Please contact support if you need assistance.</small>
    `;
    successCard.insertBefore(errorDiv, successCard.firstChild.nextSibling);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Get order ID from URL parameter or localStorage
    const orderId = getUrlParameter('orderId') || localStorage.getItem('lastOrderId');
    
    if (orderId && AIRTABLE_CONFIG.apiKey !== 'patYOUR_PERSONAL_ACCESS_TOKEN') {
        // Fetch data from Airtable if we have an order ID and API key is configured
        fetchOrderData(orderId);
    } else {
        // Use default data for demonstration
        setDefaultData();
        
        if (!orderId) {
            console.log('No order ID found. Using default data for demonstration.');
        }
        if (AIRTABLE_CONFIG.apiKey === 'patYOUR_PERSONAL_ACCESS_TOKEN') {
            console.log('Airtable API key not configured. Please update the AIRTABLE_CONFIG object.');
        }
    }

    // Add interactive hover effects
    document.querySelectorAll('.order-info div').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(218, 165, 32, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // Animate timeline items on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
    });

    // Add click ripple effect to the back button
    document.querySelector('.btn-back').addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Development helper - remove in production
if (AIRTABLE_CONFIG.apiKey === 'patYOUR_PERSONAL_ACCESS_TOKEN') {
    console.log(`
🔧 SETUP REQUIRED:

1. Get your Airtable API Key:
   - Go to https://airtable.com/account
   - Generate a personal access token

2. Update the AIRTABLE_CONFIG object in js/orderprocessed.js with your:
   - API Key
   - Base ID: ${AIRTABLE_CONFIG.baseId}
   - Table ID: ${AIRTABLE_CONFIG.tableName}

3. Update your product page form submission to redirect with order ID:
   window.location.href = "orderprocessed.html?orderId=" + response.id;
    `);
}