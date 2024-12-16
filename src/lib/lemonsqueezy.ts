// LemonSqueezy configuration
declare global {
  interface Window {
    createLemonSqueezy: () => void;
    LemonSqueezy: {
      Setup: ({ eventHandler }: { eventHandler: (event: any) => void }) => void;
      Url: {
        Close: () => void;
      };
    };
  }
}

const LEMONSQUEEZY_VARIANT_ID = 'd131a3f7-b959-4f76-a21a-ca8cfa8f061a';

interface CheckoutOptions {
  userId?: string;
  userEmail?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

export const openCheckout = ({ userId, userEmail, onSuccess, onError }: CheckoutOptions = {}) => {
  // Build checkout URL
  const checkoutUrl = new URL(`https://weavernote.lemonsqueezy.com/buy/${LEMONSQUEEZY_VARIANT_ID}`);
  
  // Add custom data for webhook
  if (userId) {
    checkoutUrl.searchParams.append('checkout[custom][user_id]', userId);
  }
  if (userEmail) {
    checkoutUrl.searchParams.append('checkout[custom][user_email]', userEmail);
  }
  
  // Add success URL to redirect after payment
  const successUrl = new URL('/?loading=true', window.location.origin);
  checkoutUrl.searchParams.append('checkout[success_url]', successUrl.toString());
  
  // Enable embedded checkout
  checkoutUrl.searchParams.append('embed', '1');
  
  console.log('Opening checkout with URL:', checkoutUrl.toString());
  
  // Create an iframe for the checkout
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.maxWidth = '100vw';
  iframe.style.maxHeight = '100vh';
  iframe.style.zIndex = '2147483647';
  iframe.style.backgroundColor = 'transparent';
  iframe.style.border = 'none';
  iframe.style.overflow = 'auto';
  (iframe.style as any)['-webkit-overflow-scrolling'] = 'touch';
  iframe.allow = 'payment';
  
  // Add close button with responsive styling
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.position = 'fixed';
  closeButton.style.top = '20px';
  closeButton.style.right = '20px';
  closeButton.style.zIndex = '2147483648';
  closeButton.style.padding = '12px 16px';
  closeButton.style.backgroundColor = '#ffffff';
  closeButton.style.border = '1px solid #ddd';
  closeButton.style.borderRadius = '8px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '16px';
  closeButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  closeButton.style.minWidth = '44px';
  closeButton.style.minHeight = '44px';
  closeButton.onclick = () => {
    iframe.remove();
    closeButton.remove();
    onError?.();
  };
  
  // Listen for checkout complete message
  const messageHandler = function(event: MessageEvent) {
    if (event.origin === 'https://weavernote.lemonsqueezy.com') {
      try {
        console.log('Received message from LemonSqueezy:', event);
        
        // Handle both string and object data
        const data = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
        
        console.log('Parsed message data:', data);
        
        // Check for various success indicators
        const isSuccess = 
          data.type === 'checkout:complete' ||
          data.event === 'checkout:complete' ||
          data.event === 'Checkout.Success' ||
          (data.data && data.data.type === 'checkout:complete') ||
          // Check in the postrobot message format
          (data.__post_robot_11_0_0___ && Object.values(data.__post_robot_11_0_0___).some(
            (msg: any) => msg.name === 'checkout:complete' || msg.name === 'Checkout.Success'
          ));
        
        if (isSuccess) {
          console.log('Checkout completed successfully');
          iframe.remove();
          closeButton.remove();
          window.removeEventListener('message', messageHandler);
          onSuccess?.();
        }
      } catch (error) {
        // Ignore parsing errors for non-JSON messages
        if (!(error instanceof SyntaxError)) {
          console.error('Error processing message:', error);
          onError?.();
        }
      }
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Set iframe source and add to page
  iframe.src = checkoutUrl.toString();
  document.body.appendChild(iframe);
  document.body.appendChild(closeButton);
};
