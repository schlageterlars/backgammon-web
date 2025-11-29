// utils/toast.ts
export function showToast(message: string, level: 'success' | 'info' | 'warning' | 'danger' = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '1rem';
        container.style.right = '1rem';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${level} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.textContent = message;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-close';
    button.setAttribute('data-bs-dismiss', 'alert');
    button.setAttribute('aria-label', 'Close');
    button.addEventListener('click', () => {
        container?.removeChild(alertDiv);
    });

    alertDiv.appendChild(button);
    container.appendChild(alertDiv);

    setTimeout(() => {
        if (container && container.contains(alertDiv)) {
            container.removeChild(alertDiv);
        }
    }, 1500);
}
