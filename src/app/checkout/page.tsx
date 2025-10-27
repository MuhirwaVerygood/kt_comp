"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import {
  ShoppingCart,
  CreditCard,
  Loader2,
  Lock,
  ArrowLeft,
  Package,
  Truck,
  LogIn,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import PaypackPaymentButton from "@/components/PaypackPaymentButton";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypack'>('stripe');
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed'>('success');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // Shipping form
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setShippingInfo((prev) => ({
        ...prev,
        fullName: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
      }));
    } else {
      // User not logged in - show modal
      setShowLoginModal(true);
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/");
    }
  }, [items, router]);

  const tax = totalAmount * 0.18; // 18% VAT
  const shipping = totalAmount > 100000 ? 0 : 5000; // Free shipping over RWF 100,000, otherwise RWF 5,000
  const total = totalAmount + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async () => {
    // Validate form
    if (
      !shippingInfo.fullName ||
      !shippingInfo.email ||
      !shippingInfo.phone ||
      !shippingInfo.address ||
      !shippingInfo.city
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // For Paypack, validation is handled in the PaypackPaymentButton component

    setIsProcessing(true);

    try {
      const token = localStorage.getItem("auth_token");

      if (paymentMethod === 'stripe') {
        // Stripe checkout
        const response = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            shippingInfo,
            totalAmount: total,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create checkout session");
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL received");
        }
      } else {
        // Paypack checkout - create order first, then let PaypackPaymentButton handle payment
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            shippingInfo,
            totalAmount: total,
          }),
        });

        const orderData = await orderResponse.json();
        if (!orderResponse.ok) {
          throw new Error(orderData.error || "Failed to create order");
        }

        console.log('✅ Order created:', orderData);
        setCurrentOrderId(orderData.data?.id || orderData.id || '');

        // The PaypackPaymentButton will handle the payment initiation
        toast.success("Order created! Please complete payment below.");
        setIsProcessing(false); // Allow user to interact with payment button
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to process checkout");
      setIsProcessing(false);
    }
  };

  // Remove the old Paypack checkout function since PaypackPaymentButton handles it

  // Remove the old polling function since PaypackPaymentButton handles real-time updates

  const handleLoginRedirect = () => {
    // Store current path to redirect back after login
    localStorage.setItem("redirect_after_login", "/checkout");
    router.push("/auth/login");
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Header />

      {/* Login Required Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-xs sm:max-w-sm md:max-w-[20vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Login Required
            </DialogTitle>
            <DialogDescription>
              You need to be logged in to proceed with checkout. Please login or
              create an account to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleLoginRedirect}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Shopping
          </button>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="+250 788 123 456"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">
                        Street Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        placeholder="KG 123 St, Kigali"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        placeholder="Kigali"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        name="district"
                        value={shippingInfo.district}
                        onChange={handleInputChange}
                        placeholder="Gasabo"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleInputChange}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'stripe' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('stripe')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={paymentMethod === 'stripe'}
                          onChange={() => setPaymentMethod('stripe')}
                          className="text-blue-600"
                        />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-gray-600">Pay securely with Stripe</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'paypack' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('paypack')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypack"
                          checked={paymentMethod === 'paypack'}
                          onChange={() => setPaymentMethod('paypack')}
                          className="text-blue-600"
                        />
                        <div>
                          <p className="font-medium">Mobile Money (Paypack)</p>
                          <p className="text-sm text-gray-600">Pay with MTN Mobile Money or Airtel Money</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paypack Payment Button */}
                  {paymentMethod === 'paypack' && currentOrderId && currentOrderId.trim() !== '' && (
                    <div className="mt-4 p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                      <h3 className="text-lg font-bold text-green-800 mb-2">🟢 PAYMENT READY - Complete Your Order</h3>
                      <p className="text-sm text-green-700 mb-4 font-medium">
                        ✅ Order #{currentOrderId} created successfully!<br/>
                        💰 Total: RWF {total.toLocaleString()}<br/>
                        📱 Enter your mobile money number below to pay.
                      </p>
                      <div className="bg-white p-4 rounded border">
                        <PaypackPaymentButton
                          amount={total}
                          orderId={currentOrderId}
                          onSuccess={async () => {
                            console.log("Payment successful, clearing cart and showing success card");
                            clearCart();
                            setShowSuccessCard(true);
                            setPaymentStatus('success');
                            setShowSuccessModal(false); // Ensure modal is hidden
                          }}
                          onError={(error) => {
                            console.log("Payment error:", error);
                            setShowSuccessCard(false); // Hide success card if shown
                            setShowSuccessModal(true);
                            setPaymentStatus('failed');
                            // Reset order ID to allow retry
                            setCurrentOrderId('');
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success Card */}
                  {showSuccessCard && paymentStatus === 'success' && (
                    <div className="mt-4 p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                      <h3 className="text-lg font-bold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        🎉 PAYMENT SUCCESSFUL!
                      </h3>
                      <p className="text-sm text-green-700 mb-4 font-medium">
                        ✅ Your payment has been processed successfully!<br/>
                        📦 Order #{currentOrderId} is now confirmed.<br/>
                        📧 You will receive an order confirmation email shortly.<br/>
                        🚚 We'll start processing your order right away.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setShowSuccessCard(false);
                            router.push('/account/orders');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          View My Orders
                        </Button>
                        <Button
                          onClick={() => {
                            setShowSuccessCard(false);
                            router.push('/');
                          }}
                          variant="outline"
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    </div>
                  )}

          

                  {/* Payment Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Lock className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {paymentMethod === 'stripe' ? 'Secure Payment with Stripe' : 'Secure Payment with Paypack'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {paymentMethod === 'stripe' 
                          ? "You'll be redirected to Stripe's secure checkout"
                          : "You'll be redirected to complete mobile money payment"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-medium">
                              RWF{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">
                          RWF {totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (18% VAT)</span>
                        <span className="font-medium">
                          RWF {tax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `RWF ${shipping.toLocaleString()}`
                          )}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-base font-bold">
                        <span>Total</span>
                        <span className="text-blue-600">
                          RWF {total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      disabled={isProcessing || (paymentMethod === 'paypack' && currentOrderId !== '')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : paymentMethod === 'paypack' && currentOrderId ? (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Order Created - Complete Payment Above
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      By placing your order, you agree to our terms and
                      conditions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Failure Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-xs sm:max-w-sm md:max-w-[20vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {paymentStatus === 'success' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Payment Successful!
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Payment Failed
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {paymentStatus === 'success'
                ? "Your payment has been processed successfully. You will receive an order confirmation email shortly."
                : "There was an issue processing your payment. Please try again or contact support."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {paymentStatus === 'success' ? (
              <>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/account/orders');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  View My Orders
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCurrentOrderId('');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
