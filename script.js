// افتح قاعدة البيانات أو أنشئها إذا لم تكن موجودة
let db;
let request = indexedDB.open('ordersDB', 1);

request.onerror = function(event) {
    console.error('حدث خطأ في فتح قاعدة البيانات:', event.target.errorCode);
};

request.onupgradeneeded = function(event) {
    // إنشاء قاعدة بيانات جديدة إذا كانت غير موجودة
    db = event.target.result;
    let objectStore = db.createObjectStore('orders', { keyPath: 'orderNumber' });

    // تحديد الفهارس للبحث السريع إذا لزم الأمر
    objectStore.createIndex('customerName', 'customerName', { unique: false });
    objectStore.createIndex('customerPhone', 'customerPhone', { unique: false });
};

request.onsuccess = function(event) {
    // فتح قاعدة البيانات بنجاح
    db = event.target.result;

    // عرض قائمة الطلبات عند تحميل الصفحة
    renderOrders();
};

// عند تقديم النموذج لإضافة طلب جديد
document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault(); // منع إعادة تحميل الصفحة

    // جمع بيانات النموذج
    let formData = {
        customerName: document.getElementById('customerName').value,
        orderNumber: document.getElementById('orderNumber').value,
        orderPrice: document.getElementById('orderPrice').value,
        orderType: document.getElementById('orderType').value,
        shippingCompany: document.getElementById('shippingCompany').value,
        orderAddress: document.getElementById('orderAddress').value,
        customerPhone: document.getElementById('customerPhone').value,
        orderDate: document.getElementById('orderDate').value
    };

    // احفظ الطلب في قاعدة البيانات
    let transaction = db.transaction(['orders'], 'readwrite');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.add(formData);

    request.onsuccess = function(event) {
        console.log('تمت إضافة الطلب بنجاح.');
        // إعادة تحميل قائمة الطلبات
        renderOrders();
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء إضافة الطلب:', event.target.error);
    };

    // مسح الحقول بعد إضافة الطلب
    document.getElementById('orderForm').reset();
});

// عرض قائمة الطلبات
function renderOrders() {
    let orderList = document.getElementById('orderList');
    orderList.innerHTML = ''; // مسح العناصر القديمة

    let transaction = db.transaction(['orders'], 'readonly');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.openCursor();

    request.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            // إنشاء عنصر li لكل طلب
            let li = document.createElement('li');
            let order = cursor.value;
            li.innerHTML = `
                <p><strong>اسم العميل:</strong> ${order.customerName}</p>
                <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
                <p><strong>سعر الطلب:</strong> ${order.orderPrice}</p>
                <p><strong>نوع الطلب:</strong> ${order.orderType}</p>
                <p><strong>شركة الشحن:</strong> ${order.shippingCompany}</p>
                <p><strong>عنوان الطلب:</strong> ${order.orderAddress}</p>
                <p><strong>رقم هاتف العميل:</strong> ${order.customerPhone}</p>
                <p><strong>تاريخ الطلب:</strong> ${order.orderDate}</p>
                <button onclick="editOrder(${order.orderNumber})">تعديل</button>
                <button onclick="deleteOrder(${order.orderNumber})">حذف</button>
            `;
            // إضافة إستماع للنقر لعرض الطلب بالكامل
            li.addEventListener('click', function() {
                viewOrderDetails(order);
            });
            orderList.appendChild(li);
            
            cursor.continue();
        } else {
            console.log('تمت عرض جميع الطلبات.');
        }
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء عرض الطلبات:', event.target.error);
    };
}

// تعديل الطلب
function editOrder(orderNumber) {
    // ابحث عن الطلب المحدد
    let transaction = db.transaction(['orders'], 'readwrite');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.get(orderNumber);

    request.onsuccess = function(event) {
        let order = event.target.result;

        // ملء الحقول في نموذج التعديل بالبيانات الحالية للطلب
        document.getElementById('editCustomerName').value = order.customerName;
        document.getElementById('editOrderNumber').value = order.orderNumber;
        document.getElementById('editOrderPrice').value = order.orderPrice;
        document.getElementById('editOrderType').value = order.orderType;
        document.getElementById('editShippingCompany').value = order.shippingCompany;
        document.getElementById('editOrderAddress').value = order.orderAddress;
        document.getElementById('editCustomerPhone').value = order.customerPhone;
        document.getElementById('editOrderDate').value = order.orderDate;

        // إظهار نافذة التعديل
        editModal.style.display = 'block';

        // الحفاظ على رقم الطلب لاستخدامه عند الحفظ
        document.getElementById('saveChangesBtn').dataset.orderNumber = order.orderNumber;
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء جلب الطلب للتعديل:', event.target.error);
    };
}

// حفظ التغييرات عند النقر على زر "حفظ التغييرات"
document.getElementById('saveChangesBtn').addEventListener('click', function() {
    let orderNumber = this.dataset.orderNumber; // الحصول على رقم الطلب

    // جمع البيانات المعدلة من نموذج التعديل
    let editedOrder = {
        customerName: document.getElementById('editCustomerName').value,
        orderNumber: document.getElementById('editOrderNumber').value,
        orderPrice: document.getElementById('editOrderPrice').value,
        orderType: document.getElementById('editOrderType').value,
        shippingCompany: document.getElementById('editShippingCompany').value,
        orderAddress: document.getElementById('editOrderAddress').value,
        customerPhone: document.getElementById('editCustomerPhone').value,
        orderDate: document.getElementById('editOrderDate').value
    };

    // تحديث الطلب في قاعدة البيانات
    let transaction = db.transaction(['orders'], 'readwrite');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.put(editedOrder);

    request.onsuccess = function(event) {
        console.log('تم تحديث الطلب بنجاح.');
        // إعادة تحميل قائمة الطلبات
        renderOrders();
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء تحديث الطلب:', event.target.error);
    };

    // إغلاق نافذة التعديل
    editModal.style.display = 'none';
});

// حذف الطلب
function deleteOrder(orderNumber) {
    // حذف الطلب من قاعدة البيانات
    let transaction = db.transaction(['orders'], 'readwrite');
    let objectStore = transaction.objectStore('orders');
    let request = objectStore.delete(orderNumber);

    request.onsuccess = function(event) {
        console.log('تم حذف الطلب بنجاح.');
        // إعادة تحميل قائمة الطلبات بعد الحذف
        renderOrders();
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء حذف الطلب:', event.target.error);
    };
}

// البحث عن الطلبات
document.getElementById('searchInput').addEventListener('input', function() {
    let searchTerm = this.value.toLowerCase().trim();

    let transaction = db.transaction(['orders'], 'readonly');
    let objectStore = transaction.objectStore('orders');
    let index = objectStore.index('customerName');

    let request = index.openCursor();

    request.onsuccess = function(event) {
        let cursor = event.target.result;
        let filteredOrders = [];

        if (cursor) {
            let order = cursor.value;
            if (
                order.customerName.toLowerCase().includes(searchTerm) ||
                order.orderNumber.toString().includes(searchTerm) ||
                order.customerPhone.includes(searchTerm)
            ) {
                filteredOrders.push(order);
            }
            cursor.continue();
        } else {
            // عرض النتائج المصفاة
            displaySearchResults(filteredOrders);
        }
    };

    request.onerror = function(event) {
        console.error('حدث خطأ أثناء البحث عن الطلبات:', event.target.error);
    };
});

// عرض نتائج البحث
function displaySearchResults(results) {
    let searchResults = document.getElementById('searchResults');
    
    // مسح النتائج القديمة
    searchResults.innerHTML = '';

    results.forEach(function(order) {
        let li = document.createElement('li');
        li.textContent = `${order.customerName} - ${order.orderNumber} - ${order.customerPhone}`;
        li.addEventListener('click', function() {
            viewOrderDetails(order);
        });
        searchResults.appendChild(li);
    });
    
    // إذا كانت قيمة حقل البحث فارغة، فسيتم مسح نتائج البحث
    if (results.length === 0 && searchInput.value.trim() === '') {
        searchResults.innerHTML = '';
    }
}

// عرض تفاصيل الطلب بالكامل
function viewOrderDetails(order) {
    alert(`
        اسم العميل: ${order.customerName}
        رقم الطلب: ${order.orderNumber}
        سعر الطلب: ${order.orderPrice}
        نوع الطلب: ${order.orderType}
        شركة الشحن: ${order.shippingCompany}
        عنوان الطلب: ${order.orderAddress}
        رقم هاتف العميل: ${order.customerPhone}
        تاريخ الطلب: ${order.orderDate}
    `);
}
