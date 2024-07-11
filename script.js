// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// بيانات الطلبات المؤقتة (يمكن استبدالها بقاعدة بيانات حقيقية)
let orders = [];

// عند تقديم النموذج لإضافة طلب جديد
document.getElementById('orderForm').addEventListener('submit', async function(event) {
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

    try {
        // إضافة الطلب إلى قاعدة البيانات
        const docRef = await addDoc(collection(db, "orders"), formData);
        console.log("Document written with ID: ", docRef.id);
        
        // إضافة الطلب إلى قائمة الطلبات المؤقتة
        orders.push(formData);

        // إعادة تحميل قائمة الطلبات
        renderOrders();

        // مسح الحقول بعد إضافة الطلب
        document.getElementById('orderForm').reset();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
});

// عرض قائمة الطلبات
function renderOrders() {
    let orderList = document.getElementById('orderList');
    orderList.innerHTML = ''; // مسح العناصر القديمة

    orders.forEach(function(order, index) {
        // إنشاء عنصر li لكل طلب
        let li = document.createElement('li');
        li.innerHTML = `
            <p><strong>اسم العميل:</strong> ${order.customerName}</p>
            <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
            <p><strong>سعر الطلب:</strong> ${order.orderPrice}</p>
            <p><strong>نوع الطلب:</strong> ${order.orderType}</p>
            <p><strong>شركة الشحن:</strong> ${order.shippingCompany}</p>
            <p><strong>عنوان الطلب:</strong> ${order.orderAddress}</p>
            <p><strong>رقم هاتف العميل:</strong> ${order.customerPhone}</p>
            <p><strong>تاريخ الطلب:</strong> ${order.orderDate}</p>
            <button onclick="editOrder(${index})">تعديل</button>
            <button onclick="deleteOrder(${index})">حذف</button>
        `;
        // إضافة إستماع للنقر لعرض الطلب بالكامل
        li.addEventListener('click', function() {
            viewOrderDetails(order);
        });
        orderList.appendChild(li);
    });
}

// تعديل الطلب
function editOrder(index) {
    // يمكنك هنا تنفيذ الكود اللازم لتعديل الطلب
    // مثال: يمكنك فتح نافذة تعديل أو استخدام نموذج للتعديل
    let order = orders[index]; // الطلب المحدد للتعديل

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

    // الحفاظ على معرف الطلب لاستخدامه عند الحفظ
    document.getElementById('saveChangesBtn').dataset.index = index;
}

// حفظ التغييرات عند النقر على زر "حفظ التغييرات"
document.getElementById('saveChangesBtn').addEventListener('click', function() {
    let index = this.dataset.index; // الحصول على معرف الطلب
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

    try {
        // تحديث الطلب في قاعدة البيانات
        const orderRef = doc(db, "orders", index);
        await updateDoc(orderRef, editedOrder);

        // تحديث الطلب في المصفوفة
        orders[index] = editedOrder;

        // إعادة تحميل قائمة الطلبات
        renderOrders();

        // إغلاق نافذة التعديل
        editModal.style.display = 'none';
    } catch (e) {
        console.error("Error updating document: ", e);
    }
});

// حذف الطلب
async function deleteOrder(index) {
    try {
        // حذف الطلب من قاعدة البيانات
        const orderRef = doc(db, "orders", index);
        await deleteDoc(orderRef);

        // حذف الطلب من المصفوفة
        orders.splice(index, 1);

        // إعادة تحميل قائمة الطلبات بعد الحذف
        renderOrders();
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
}

// البحث عن الطلبات
document.getElementById('searchInput').addEventListener('input', function() {
    let searchTerm = this.value.toLowerCase().trim();
    let filteredOrders = orders.filter(function(order) {
        return (
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.orderNumber.toString().includes(searchTerm) ||
            order.customerPhone.includes(searchTerm)
        );
    });

    // عرض النتائج المصفاة
    displaySearchResults(filteredOrders);
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

// استدعاء دالة عرض قائمة الطلبات عند تحميل الصفحة
renderOrders();
