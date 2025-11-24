import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { BillingIcon, DeleteIcon, GreyAdd } from "../../../components/Icons";
import Modal from "./Modal";
import toast from "react-hot-toast";
import { DeleteSavedCard } from "../../../services/billings";
import { api } from "../../../services/api";

const PaymentMethods = ({ cards, setCards, isLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [showCard, setShowCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingDefaultCardId, setSettingDefaultCardId] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create SetupIntent on backend
      const setupIntentResponse = await api.post(
        "/billing/cards/setup-intent",
      );
      const { client_secret, should_set_default } = setupIntentResponse;

      if (!client_secret) {
        throw new Error("Failed to create setup intent");
      }

      // Step 2: Confirm card setup with Stripe
      const { error, setupIntent } = await stripe.confirmCardSetup(
        client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        },
      );

      if (error) {
        toast.error(error.message || "Failed to add card");
        setIsProcessing(false);
        return;
      }

      // Step 3: If this is the first card, set it as default
      if (should_set_default && setupIntent.payment_method) {
        await api.put("/billing/cards/default", {
          payment_method_id: setupIntent.payment_method,
        });
      }

      // Step 4: Success - payment method is automatically attached
      toast.success("Card added successfully");

      // Refresh card list
      const cardsResponse = await api.get("/billing/cards");
      if (cardsResponse && cardsResponse.cards) {
        setCards(cardsResponse.cards);
      }

      // Reset form
      setShowCard(false);
      elements.getElement(CardElement).clear();
    } catch (error) {
      console.error("Error adding card:", error);
      toast.error(error.message || "Failed to add card");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCardId) return;
    try {
      await DeleteSavedCard(selectedCardId);
      setCards(prev => prev.filter(card => card.id !== selectedCardId));
      setShowModal(false);
      toast.success("Card deleted successfully");
      setSelectedCardId(null);
    } catch (err) {
      console.error("Failed to delete card:", err);
    }
  };

  const handleSetDefault = async cardId => {
    setSettingDefaultCardId(cardId);
    try {
      await api.put("/billing/cards/default", {
        payment_method_id: cardId,
      });
      toast.success("Default card updated successfully");

      // Refresh card list to show updated default status
      const cardsResponse = await api.get("/billing/cards");
      if (cardsResponse && cardsResponse.cards) {
        setCards(cardsResponse.cards);
      }
    } catch (err) {
      console.error("Failed to set default card:", err);
      toast.error("Failed to set default card");
    } finally {
      setSettingDefaultCardId(null);
    }
  };

  return (
    <div className="flex flex-col gap-y-2.5 bg-white border border-[#6D6D6D] p-4 rounded-[8px] shadow-md w-full h-full">
      <div className="flex items-center justify-between">
        <p className="text-[20px] font-semibold font-urbanist">
          Payment Methods
        </p>
        <div
          className="flex items-center bg-white rounded-[6px] border border-[#0387FF] cursor-pointer gap-x-2 h-[34px] px-3"
          onClick={() => setShowCard(!showCard)}
        >
          <GreyAdd />
          <p className="text-[#0387FF] font-normal text-[16px]">
            Add New Credit Card
          </p>
        </div>
      </div>

      <div className="custom-scroll1 overflow-y-auto max-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-[#0387FF]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : cards?.length > 0 ? (
          cards
            .sort((a, b) => {
              // Sort default card to the top
              if (a.is_default && !b.is_default) return -1;
              if (!a.is_default && b.is_default) return 1;
              return 0;
            })
            .map(card => {
              const isDefault = card.is_default === true;

            return (
              <div
                key={card.id}
                className="flex items-center justify-between text-[#6D6D6D] text-[16px] font-normal border-b border-[#CCCCCC] py-2.5"
              >
                <div className="text-[#6D6D6D] text-[16px] font-normal flex items-center gap-2 px-1 flex-1">
                  <BillingIcon className="text-[#0387ff]" />
                  <p>
                    Ending in **** {card.card.last4}, Card expires at:{" "}
                    {card.card.exp_month} / {card.card.exp_year}
                  </p>
                </div>
                <div className="flex items-center gap-x-2">
                  {isDefault && (
                    <button className="px-3 py-1 rounded-[4px] bg-yellow-500 text-white text-[14px] font-medium">
                      Default card
                    </button>
                  )}
                  {!isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(card.id)}
                        disabled={settingDefaultCardId === card.id}
                        className="px-3 py-1 rounded-[4px] bg-[#0387FF] text-white text-[14px] font-medium hover:bg-[#0270D9] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {settingDefaultCardId === card.id
                          ? "Setting..."
                          : "Set as Default"}
                      </button>
                      <div
                        className="cursor-pointer px-1"
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setShowModal(true);
                        }}
                      >
                        <DeleteIcon />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-[#6D6D6D]">
            No payment methods available
          </div>
        )}
      </div>

      {showCard && (
        <div className="flex flex-col gap-y-4 border border-[#6D6D6D] rounded-[8px] shadow-md p-4 bg-[white] mt-3">
          <div className="flex flex-col items-start gap-y-3 w-full">
            <p className="text-[#6D6D6D] text-[16px] font-normal">
              Card Details
            </p>
            <div className="w-full">
              <CardElement
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: "14px",
                      color: "#454545",
                      "::placeholder": {
                        color: "#7E7E7E",
                      },
                    },
                    invalid: {
                      color: "#FF0000",
                    },
                  },
                }}
                className="p-3 border border-[#7E7E7E] rounded-[6px]"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!stripe || isProcessing}
            className="w-full h-[40px] rounded-[6px] bg-[#0387ff] text-sm font-normal text-[#FFFFFF] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? "Processing..." : "Add Card"}
          </button>
        </div>
      )}

      {showModal && (
        <Modal
          title="Delete Item"
          text="Are you sure you would like delete this item? This action cannot be undone."
          actionButton="Delete"
          onClose={() => setShowModal(false)}
          onClick={handleDelete}
        />
      )}
    </div>
  );
};

export default PaymentMethods;
