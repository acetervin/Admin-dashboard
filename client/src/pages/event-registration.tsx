import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { Event, EventRegistrationData, PaymentInitiationResponse } from "@/types";

export default function EventRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<"individual" | "organization">("individual");
  const [formData, setFormData] = useState<EventRegistrationData>({
    registrationType: "individual",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    organizationName: "",
  });

  // Get event ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const eventName = urlParams.get("name");

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: eventDetails } = useQuery({
    queryKey: ["/api/events", selectedEvent],
    enabled: !!selectedEvent,
  });

  const registerForEvent = useMutation({
    mutationFn: async (data: EventRegistrationData): Promise<PaymentInitiationResponse> => {
      const response = await apiRequest("POST", `/api/events/${selectedEvent}/register`, data);
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Pesapal payment page
      window.location.href = data.redirectUrl;
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Failed to register for event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    registerForEvent.mutate({
      ...formData,
      registrationType,
    });
  };

  // Find event by name if provided in URL
  const currentEvent = eventName && events 
    ? events.find((event: Event) => event.name === eventName)
    : eventDetails;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading events...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (eventName && !currentEvent) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-error text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Unable to Load Event</h1>
          <p className="text-neutral-600 mb-8">
            We're having trouble loading this event. This could be because:
          </p>
          <ul className="text-left max-w-md mx-auto mb-8 space-y-2 text-neutral-600">
            <li>• The event has ended or been removed</li>
            <li>• There might be a temporary connection issue</li>
            <li>• The event URL might be incorrect</li>
          </ul>
          <p className="text-neutral-600 mb-8">
            Please try again later or contact our support team if the problem persists.
          </p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="outline">Contact Support</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {currentEvent ? (
        <>
          {/* Event Header */}
          <section className="bg-neutral-800 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-success text-white">
                  <i className="fas fa-check mr-1"></i>
                  Registration Open
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{currentEvent.name}</h1>
              <p className="text-xl text-neutral-300 mb-8">{currentEvent.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-calendar text-white"></i>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Date</p>
                    <p className="font-semibold">{new Date(currentEvent.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-map-marker-alt text-white"></i>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Location</p>
                    <p className="font-semibold">{currentEvent.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tag text-white"></i>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Registration Fee</p>
                    <p className="font-semibold">KES {currentEvent.registrationFee}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Registration Form */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                  Register for {currentEvent.name}
                </h2>
                <p className="text-neutral-600">
                  Complete the registration form below to secure your spot at this event. 
                  Choose between individual or organization registration.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentEvent.name}</span>
                    <span className="text-lg font-normal text-primary">KES {currentEvent.registrationFee}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as "individual" | "organization")}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="individual">Individual Registration</TabsTrigger>
                      <TabsTrigger value="organization">Organization Registration</TabsTrigger>
                    </TabsList>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <TabsContent value="individual" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="middleName">Middle Name (Optional)</Label>
                          <Input
                            id="middleName"
                            type="text"
                            value={formData.middleName}
                            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="organization" className="space-y-4">
                        <div>
                          <Label htmlFor="organizationName">Organization Name</Label>
                          <Input
                            id="organizationName"
                            type="text"
                            value={formData.organizationName}
                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                            required={registrationType === "organization"}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">Contact Person First Name</Label>
                            <Input
                              id="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Contact Person Last Name</Label>
                            <Input
                              id="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="254712345678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="bg-neutral-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-neutral-800 mb-2">Registration Summary</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-600">Registration Fee:</span>
                          <span className="font-semibold text-lg">KES {currentEvent.registrationFee}</span>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerForEvent.isPending}
                        onClick={() => setSelectedEvent(currentEvent.id)}
                      >
                        {registerForEvent.isPending ? "Processing..." : "Register & Pay Now"}
                      </Button>
                    </form>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      ) : (
        /* Event Selection */
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-800 mb-4">Event Registration</h1>
              <p className="text-neutral-600">Select an event to register for</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events?.map((event: Event) => (
                <Card key={event.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {event.imageUrl && (
                      <img 
                        src={event.imageUrl} 
                        alt={event.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-success text-white">Registration Open</Badge>
                      <span className="text-sm text-neutral-500">KES {event.registrationFee}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">{event.name}</h3>
                    <p className="text-neutral-600 mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-neutral-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-calendar"></i>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-users"></i>
                          <span>Max {event.maxParticipants} participants</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedEvent(event.id)}
                    >
                      Register Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
