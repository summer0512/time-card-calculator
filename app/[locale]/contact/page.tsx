"use client";

import { useState, use } from "react";
import { useTranslations } from 'next-intl';
import HeadInfo from '@/components/head-info';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Send, CheckCircle, Clock, Users, Zap } from "lucide-react";

export default function ContactPage(props: {params: Promise<{locale: string}>}) {
  const params = use(props.params);
  const t = useTranslations('ContactPage');
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('Form submitted successfully:', data);
      
      setIsSubmitted(true);
      setFormData({ email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
      // You could add error handling here, like showing an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col bg-gradient-to-br from-gray-50 to-white">
        <HeadInfo 
          locale={params.locale} 
          page="contact" 
          title={t('title')} 
          description={t('description')}
          keywords={t('keywords')}
        />
        <main className="flex-1 py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-12 text-center">
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Thank You!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Your message has been sent successfully. We'll get back to you within 72 hours.
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <HeadInfo 
        locale={params.locale} 
        page="contact" 
        title={t('title')} 
        description={t('description')}
        keywords={t('keywords')}
      />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our time card calculator? Need help with payroll calculations? 
              We're here to help you streamline your time tracking process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        className="mt-2"
                        placeholder="What can we help you with?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className={`mt-2 min-h-[120px] ${errors.message ? 'border-red-500' : ''}`}
                        placeholder="Tell us about your time tracking needs, questions, or feedback..."
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info & Features */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <Mail className="h-5 w-5 mr-2 text-green-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Email</p>
                        <p className="text-sm text-gray-600">info@time-card-calculator.work</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Response Time</p>
                        <p className="text-sm text-gray-600">Within 72 hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Why Contact Us */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="text-lg text-gray-800">
                    Why Contact Us?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Expert Support</p>
                        <p className="text-sm text-gray-600">Get help from time tracking professionals</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Zap className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Feature Requests</p>
                        <p className="text-sm text-gray-600">Suggest new calculator features</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Bug Reports</p>
                        <p className="text-sm text-gray-600">Help us improve the calculator</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              {/* <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Quick Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Be specific about your time tracking needs</li>
                    <li>• Include screenshots if reporting issues</li>
                    <li>• Mention your industry for tailored advice</li>
                    <li>• Ask about bulk calculations or integrations</li>
                  </ul>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}