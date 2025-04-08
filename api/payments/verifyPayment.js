export const verifyPayment = async (req, res) => {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    try {
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Unauthorized: No User ID found" });
        }

        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({ message: "Reference is required." });
        }

        if (!PAYSTACK_SECRET_KEY) {
            return res.status(500).json({ message: "Paystack secret key not configured." });
        }

        const verifyPaymentOnPaystack = async (ref) => {
            const response = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const responseData = await response.json();
            return responseData;
        };

        const paystackResponse = await verifyPaymentOnPaystack(reference);

        if (paystackResponse.status === false) {
            return res.status(500).json({ message: paystackResponse.message });
        }

        res.status(200).json({message: "Succesful", data: paystackResponse.data.subaccount});
    } catch (error) {
        console.error("Error Verifying Payment:", error);
    
        res.status(500).json({
          message: "Error Verifying Payment",
          error: error.message || "Unknown server error",
        });
      };
}